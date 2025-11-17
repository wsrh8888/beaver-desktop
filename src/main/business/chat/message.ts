import type {
  IChatHistoryReq,
  IChatHistoryRes,
  IChatMessageVerRangeRes
} from 'commonModule/type/ajax/chat'
import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { BaseBusiness, type QueueItem } from '../base/base'
import { chatSyncApi } from 'mainModule/api/chat'
import { MessageService } from 'mainModule/database/services/chat/message'
import { UserService } from 'mainModule/database/services/user/user'
import { NotificationModule, NotificationChatCommand } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'

/**
 * 消息同步队列项
 */
interface MessageSyncItem extends QueueItem {
  conversationId: string
  minVersion: number
  maxVersion: number
}

/**
 * 消息业务逻辑
 * 对应 chat_messages 表
 * 负责消息的处理、状态更新等业务逻辑
 */
export class MessageBusiness extends BaseBusiness<MessageSyncItem> {
  protected readonly businessName = 'MessageBusiness'

  constructor() {
    super({
      queueSizeLimit: 20, // 消息同步请求较多
      delayMs: 1000,
    })
  }
  /**
   * 获取聊天历史
   */
  async getChatHistory(_header: ICommonHeader, params: IChatHistoryReq): Promise<IChatHistoryRes> {
    const conversationId = params.conversationId
    const seq = params.seq // 可选，用于加载历史消息（比这个seq更小的消息）
    const limit = params.limit || 100

    // 调用服务层获取消息数据（纯数据库查询）
    const messages = await MessageService.getChatHistory(conversationId, { seq, limit })

    // 判断是否还有更多数据（返回 limit+1 条，如果超过 limit 条说明有更多数据）
    const hasMore = messages.length > limit
    const actualMessages = hasMore ? messages.slice(0, limit) : messages

    // 业务逻辑：获取所有发送者ID（排除空值）
    const senderIds = [...new Set(actualMessages.map((m: any) => m.sendUserId).filter((id: string) => id && id.trim()))]

    // 业务逻辑：获取发送者信息
    const senderInfoMap = new Map()
    if (senderIds.length > 0) {
      try {
        const senderDetails = await UserService.getUsersBasicInfo(senderIds as string[])
        senderDetails.forEach((detail) => {
          senderInfoMap.set(detail.userId, {
            userId: detail.userId,
            nickname: detail.nickName,
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
          nickname: senderDetail?.nickname || (message.sendUserId ? '用户' : '系统消息'),
        },
        create_at: new Date(message.createdAt * 1000).toISOString().slice(0, 19).replace('T', ' '), // 转换为前端期望的格式
        status: 0, // 消息状态：正常（只增不修改原则）
        sendStatus: message.sendStatus || 0, // 发送状态（前端需要）
      }
    })

    return {
      count: formattedMessages.length, // 当前页的数量
      list: formattedMessages,
    }
  }

  /**
   * 按序列号范围获取消息（用于数据同步）
   */
  async getChatMessagesBySeqRange(_header: ICommonHeader, params: { conversationId: string, startSeq: number, endSeq: number }): Promise<IChatMessageVerRangeRes> {
    const { conversationId, startSeq, endSeq } = params

    // 调用服务层获取消息数据（纯数据库查询）
    const result = await MessageService.getChatMessagesBySeqRange(conversationId, startSeq, endSeq)

    // 业务逻辑：获取发送者信息（同步接口也需要完整用户信息）
    const senderIds = [...new Set(result.map((m: any) => m.sendUserId).filter((id: string) => id && id.trim()))]
    const senderInfoMap = new Map()
    if (senderIds.length > 0) {
      try {
        const senderDetails = await UserService.getUsersBasicInfo(senderIds as string[])
        senderDetails.forEach((detail) => {
          senderInfoMap.set(detail.userId, {
            userId: detail.userId,
            nickname: detail.nickName,
            avatar: detail.avatar,
          })
        })
      }
      catch (error) {
        console.warn('[DEBUG] Failed to get sender details in seq range query:', error)
      }
    }

    // 业务逻辑：转换为 IChatHistory 格式
    const formattedMessages = result.map((message: any) => {
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
          nickname: senderDetail?.nickname || (message.sendUserId ? '用户' : '系统消息'),
        },
        create_at: new Date(message.createdAt * 1000).toISOString().slice(0, 19).replace('T', ' '), // 转换为前端期望的格式
        status: 0, // 消息状态：正常（只增不修改原则）
        sendStatus: message.sendStatus || 1, // 发送状态（客户端使用）
      }
    })

    return {
      list: formattedMessages,
    }
  }


  /**
   * 通过版本区间从服务端同步消息数据
   * 直接使用WS推送的版本范围，不查询本地数据
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
      } else {
        console.log(`消息已同步: conversationId=${conversationId}, range=[${minVersion}, ${maxVersion}]`)
      }

    } catch (error) {
      console.error('通过版本区间同步消息失败:', error)
    }
  }

  /**
   * 通过单个版本号从服务端同步消息数据
   * 将同步请求加入队列，1秒后批量处理
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
   * 批量处理消息同步请求
   */
  protected async processBatchRequests(items: MessageSyncItem[]): Promise<void> {
    // 按 conversationId 聚合版本范围
    const conversationMap = new Map<string, { minVersion: number, maxVersion: number }>()

    for (const item of items) {
      const existing = conversationMap.get(item.conversationId)
      if (existing) {
        existing.minVersion = Math.min(existing.minVersion, item.minVersion)
        existing.maxVersion = Math.max(existing.maxVersion, item.maxVersion)
      } else {
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
        conversationId: conversationId,
        seq: versionRange.maxVersion, // 使用最大版本号作为最新序列号
      })
    }
  }

  /**
   * 处理同步到的消息数据
   */
  private async handleSyncedMessages(messages: any[]) {
    if (messages.length === 0) return

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
      createdAt: msg.createAt,
      updatedAt: Math.floor(Date.now() / 1000),
    }))



    // 批量保存到本地数据库
    await MessageService.batchCreate(formattedMessages)

    console.log('消息数据保存成功:', formattedMessages.length, '条')
  }
}

// 导出单例实例
export const messageBusiness = new MessageBusiness()
