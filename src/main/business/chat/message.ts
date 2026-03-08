import { BaseBusiness } from '../base/base'
import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IChatHistoryReq, IChatHistoryRes, IChatMessageVerRangeReq, IChatMessageVerRangeRes, IChatHistory } from 'commonModule/type/ajax/chat'
import { MessageStatus } from 'commonModule/type/ajax/chat'
import { chatSyncApi } from 'mainModule/api/chat'
import type { QueueItem } from '../base/base'
import dBServiceMessage from 'mainModule/database/services/chat/message'
import dBServiceUser from 'mainModule/database/services/user/user'
import { generateMessagePreview } from 'commonModule/utils/conversation/message'
import type { IChatMessageSendBody } from 'commonModule/type/ws/message-types'
import { WsType } from 'commonModule/type/ws/command'
import wsManager from 'mainModule/ws-manager'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'
import type { DBCreateMessageReq } from 'commonModule/type/database/server/chat/message'
import { SendStatus } from 'commonModule/type/database/db/chat'

export interface MessageSyncItem extends QueueItem {
  conversationId: string
  minVersion: number
  maxVersion: number
}

class MessageBusiness extends BaseBusiness<MessageSyncItem> {
  protected readonly businessName = 'MessageBusiness'

  private sendingTimers = new Map<string, NodeJS.Timeout>()

  constructor() {
    super({
      queueSizeLimit: 20, // 消息同步请求较多
      delayMs: 1000,
    })
  }

  /**
   * @description: 本地发送消息核心业务 (Main 进程接管)
   */
  async sendMessage(userId: string, data: IChatMessageSendBody): Promise<IChatHistory> {
    const { conversationId, messageId, msg, chatType } = data

    // 1. 本地落库 (发送中状态)
    const dbData: DBCreateMessageReq = {
      messageId,
      conversationId,
      conversationType: chatType === 'private' ? 1 : 2,
      sendUserId: userId,
      msgType: msg.type,
      msgPreview: generateMessagePreview(msg),
      msg: JSON.stringify(msg),
      seq: 0,
      sendStatus: SendStatus.SENDING,
      createdAt: Math.floor(Date.now() / 1000).toString(),
    } as any // 数据库层期望的类型略有差异，这里做个兼容转写
    await dBServiceMessage.create(dbData)

    // 2. 构造即时同步到 Render 的结构
    // 优先从本地数据库获取发送者（自己）的基础信息
    let senderInfo = { avatar: '', nickName: '' }
    try {
      const userDetails = await dBServiceUser.getUsersBasicInfo({ userIds: [userId] })
      if (userDetails && userDetails.length > 0) {
        senderInfo = {
          avatar: userDetails[0].avatar || '',
          nickName: userDetails[0].nickName || '',
        }
      }
    } catch (e) {
      console.error('[MessageBusiness] 获取发送者本地信息失败:', e)
    }

    const formattedMessage: IChatHistory = {
      id: 0,
      messageId,
      conversationId,
      seq: 0,
      msg: msg as any,
      sender: {
        userId,
        ...senderInfo,
      },
      created_at: new Date().toISOString(),
      sendStatus: MessageStatus.SENDING,
    }

    // 3. 广播给所有渲染进程 (包括发起的窗口)，实现多窗同步和逻辑归一
    sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.MESSAGE_UPDATE, {
      conversationId,
      message: formattedMessage
    })

    // 4. 投递给 WS 通信链路
    const wsType = chatType === 'private'
      ? WsType.PRIVATE_MESSAGE_SEND
      : WsType.GROUP_MESSAGE_SEND

    wsManager.sendMessage({
      command: 'CHAT_MESSAGE',
      content: {
        timestamp: Date.now(),
        messageId,
        data: {
          type: wsType,
          conversationId,
          body: data,
        },
      },
    })

    // 4. 开启超时检测
    const timer = setTimeout(() => {
      this.handleMessageTimeout(messageId, conversationId)
    }, 10000) // 默认 10s 超时
    this.sendingTimers.set(messageId, timer)

    return formattedMessage
  }

  /**
   * @description: 清除特定消息的计时器 (ACK 确认后)
   */
  clearTimers(messageIds: string[]) {
    messageIds.forEach((mid) => {
      const timer = this.sendingTimers.get(mid)
      if (timer) {
        clearTimeout(timer)
        this.sendingTimers.delete(mid)
      }
    })
  }

  /**
   * @description: 处理发送超时
   */
  private async handleMessageTimeout(messageId: string, conversationId: string) {
    this.sendingTimers.delete(messageId)

    // 1. 检查当前数据库中的状态
    // 如果已经不再是发送中（可能被 ACK 确认为成功了），则直接退出
    const currentMsg = await dBServiceMessage.getById(messageId)
    if (!currentMsg || currentMsg.sendStatus !== SendStatus.SENDING) {
      console.log(`[MessageBusiness] 消息 ${messageId} 已处理或不再是发送中状态，取消超时处理`)
      return
    }

    console.warn(`[MessageBusiness] 消息发送超时: ${messageId}`)

    // 2. 更新数据库状态为失败
    await dBServiceMessage.batchUpdateSendStatus({
      messageIds: [messageId],
      sendStatus: SendStatus.FAILED
    })

    // 3. 通知所有 Render 进程 UI 变更
    sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.MESSAGE_UPDATE, {
      conversationId,
      messageId,
      sendStatus: MessageStatus.FAILED
    })
  }

  /**
   * 获取聊天历史
   */
  async getChatHistory(_header: ICommonHeader, params: IChatHistoryReq): Promise<IChatHistoryRes> {
    try {
      const conversationId = params.conversationId
      const seq = params.seq // 可选，用于加载历史消息（比这个seq更小的消息）
      const limit = params.limit || 100

      // 调用服务层获取消息数据（纯数据库查询）
      const messages = await dBServiceMessage.getChatHistory({ conversationId, seq, limit })
      console.log('[MessageBusiness] getChatHistory 本地DB查询结果:', conversationId, '条数:', messages.length)

      // 判断是否还有更多数据（返回 limit+1 条，如果超过 limit 条说明有更多数据）
      const hasMore = messages.length > limit
      const actualMessages = hasMore ? messages.slice(0, limit) : messages

      // 业务逻辑：获取所有发送者ID（排除空值）
      const senderIds = [...new Set(actualMessages.map((m: any) => m.sendUserId).filter((id: string) => id && id.trim()))]

      // 业务逻辑：获取发送者信息
      const senderInfoMap = new Map()
      if (senderIds.length > 0) {
        try {
          const senderDetails = await dBServiceUser.getUsersBasicInfo({ userIds: senderIds as string[] })
          senderDetails.forEach((detail) => {
            senderInfoMap.set(detail.userId, {
              userId: detail.userId,
              nickName: detail.nickName,
              avatar: detail.avatar,
            })
          })
        }
        catch (error) {
          console.error('Failed to get sender details in chat history:', error)
        }
      }

      // 业务逻辑：转换数据格式以匹配前端期望的API响应格式
      const formattedMessages = actualMessages.map((message: any) => {
        const senderDetail = senderInfoMap.get(message.sendUserId)
        return {
          id: message.id,
          messageId: message.messageId,
          conversationId: message.conversationId,
          seq: message.seq,
          msg: typeof message.msg === 'string' ? JSON.parse(message.msg) : message.msg, // 解析JSON字符串
          sender: {
            userId: message.sendUserId || '',
            avatar: senderDetail?.avatar || '',
            nickName: senderDetail?.nickName || (message.sendUserId ? '用户' : '系统消息'),
          },
          // 按照你的要求简写：
          created_at: message.createdAt ? new Date(Number(message.createdAt) * 1000) : new Date(),
          sendStatus: message.sendStatus || 0, // 发送状态（前端需要）
        }
      })

      return {
        count: formattedMessages.length, // 当前页的数量
        list: formattedMessages,
      }
    }
    catch (error) {
      console.error('Failed to get chat history:', error)
      return {
        count: 0,
        list: [],
      }
    }
  }

  /**
   * 按序列号范围获取消息
   */
  async getChatMessagesBySeqRange(_header: ICommonHeader, params: IChatMessageVerRangeReq): Promise<IChatMessageVerRangeRes> {
    try {
      const messages = await dBServiceMessage.getChatMessagesBySeqRange({
        conversationId: params.conversationId!,
        startSeq: params.startSeq,
        endSeq: params.endSeq,
      })

      // 获取发送者信息
      const senderIds = [...new Set(messages.map((m: any) => m.sendUserId).filter((id: any) => id))]
      const senderInfoMap = new Map()
      if (senderIds.length > 0) {
        const senderDetails = await dBServiceUser.getUsersBasicInfo({ userIds: senderIds as string[] })
        senderDetails.forEach(d => senderInfoMap.set(d.userId, d))
      }

      const list = messages.map((m: any) => {
        const sender = senderInfoMap.get(m.sendUserId)
        return {
          id: m.id,
          messageId: m.messageId,
          conversationId: m.conversationId,
          seq: m.seq,
          msg: typeof m.msg === 'string' ? JSON.parse(m.msg) : m.msg,
          sender: {
            userId: m.sendUserId || '',
            avatar: sender?.avatar || '',
            nickName: sender?.nickName || (m.sendUserId ? '用户' : '系统消息'),
          },
          created_at: m.createdAt ? new Date(Number(m.createdAt) * 1000) : new Date(),
          status: 0,
          sendStatus: m.sendStatus || 0,
        }
      })

      return { list } as any
    }
    catch (error) {
      console.error('Failed to get messages by seq range:', error)
      return { list: [] } as any
    }
  }

  /**
   * 批量删除消息
   */
  async batchDelete(_header: ICommonHeader, params: { messageIds: string[] }): Promise<{ success: boolean }> {
    try {
      await dBServiceMessage.batchDelete(params.messageIds)
      return { success: true }
    }
    catch (error) {
      console.error('Failed to batch delete messages:', error)
      return { success: false }
    }
  }

  /**
   * 这里的同步逻辑是基于会话的版本范围来同步的
   */
  async syncMessagesByVersionRange(conversationId: string, minVersion: number, maxVersion: number) {
    try {
      // 直接使用WS推送的版本范围作为seq范围（假设版本号对应seq）
      const fromSeq = minVersion
      const toSeq = maxVersion

      // 调用现有的chatSyncApi按seq范围获取数据
      const response = await chatSyncApi({
        conversationId,
        fromSeq,
        toSeq,
        limit: 100, // 限制每次同步的数量
      })

      if (response.result?.messages && response.result.messages.length > 0) {
        // 处理同步到的消息数据
        await this.handleSyncedMessages(response.result.messages)

        console.log(`消息同步成功: conversationId=${conversationId}, range=[${minVersion}, ${maxVersion}], count=${response.result.messages.length}`)
      }
      else {
        console.log(`消息已同步: conversationId=${conversationId}, range=[${minVersion}, ${maxVersion}]`)
      }
    }
    catch (error) {
      console.error('通过版本区间同步消息失败:', error)
    }
  }

  private async handleSyncedMessages(messages: any[]) {
    if (messages.length === 0)
      return

    console.log('同步到消息数据:', messages.length, '条')

    // 格式化消息数据，转换为数据库格式
    const formattedMessages = messages.map(msg => ({
      messageId: msg.messageId,
      conversationId: msg.conversationId,
      conversationType: msg.conversationType,
      sendUserId: msg.sendUserId,
      msgType: msg.msgType,
      targetMessageId: msg.targetMessageId || null, // 引用消息ID（撤回/删除等）
      msgPreview: msg.msgPreview,
      msg: msg.msg,
      seq: msg.seq,
      // sendStatus: 默认值1（已发送）- 服务端同步的消息
      sendStatus: 1,
      createdAt: msg.createdAt,
      updatedAt: Math.floor(Date.now() / 1000),
    }))

    // 批量保存到本地数据库
    await dBServiceMessage.batchCreate({ messages: formattedMessages })

    console.log('消息数据保存成功:', formattedMessages.length, '条')
  }


  /**
   * 这里的同步逻辑是基于会话的具体版本来同步的
   */
  async syncMessagesByVersion(conversationId: string, version: number) {
    this.addToQueue({
      key: conversationId,
      data: { conversationId, version },
      timestamp: Date.now(),
      conversationId,
      minVersion: version,
      maxVersion: version,
    })
  }

  /**
   * 实现 BaseBusiness 的抽象方法
   */
  protected async processBatchRequests(items: MessageSyncItem[]): Promise<void> {
    // 按 conversationId 聚合版本范围
    const conversationMap = new Map<string, { minVersion: number, maxVersion: number }>()

    for (const item of items) {
      const existing = conversationMap.get(item.conversationId)
      if (existing) {
        existing.minVersion = Math.min(existing.minVersion, item.minVersion)
        existing.maxVersion = Math.max(existing.maxVersion, item.maxVersion)
      }
      else {
        conversationMap.set(item.conversationId, {
          minVersion: item.minVersion,
          maxVersion: item.maxVersion,
        })
      }
    }

    // 批量同步消息数据
    for (const [conversationId, versionRange] of conversationMap) {
      await this.syncMessagesByVersionRange(conversationId, versionRange.minVersion, versionRange.maxVersion)
    }

    // 发送消息表更新通知 - 为每个更新的会话发送通知
    for (const [conversationId, versionRange] of conversationMap) {
      sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.MESSAGE_UPDATE, {
        conversationId,
        seq: versionRange.maxVersion, // 使用最大版本号作为最新序列号
      })
    }
  }
}

export default new MessageBusiness()
