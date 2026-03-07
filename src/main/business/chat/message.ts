import { BaseBusiness } from '../base/base'
import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IChatHistoryReq, IChatHistoryRes, IChatMessageVerRangeReq, IChatMessageVerRangeRes } from 'commonModule/type/ajax/chat'
import type { QueueItem } from '../base/base'
import dBServiceMessage from 'mainModule/database/services/chat/message'
import dBServiceUser from 'mainModule/database/services/user/user'

export interface MessageSyncItem extends QueueItem {
  conversationId: string
  minVersion: number
  maxVersion: number
}

class MessageBusiness extends BaseBusiness<MessageSyncItem> {
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
    this.addToQueue({
      key: conversationId,
      data: { conversationId, minVersion, maxVersion },
      timestamp: Date.now(),
      conversationId,
      minVersion,
      maxVersion,
    })
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
   * 处理同步消息
   */
  async handleSyncedMessages(messages: any[]) {
    if (!messages || messages.length === 0)
      return

    try {
      // 这里的处理逻辑需要根据实际情况来实现
      // 一般是将同步下来的消息写入本地数据库
      console.log('处理同步下来的消息:', messages.length)
    }
    catch (error) {
      console.error('Failed to handle synced messages:', error)
    }
  }

  /**
   * 实现 BaseBusiness 的抽象方法
   */
  protected async processBatchRequests(items: MessageSyncItem[]) {
    // 聚合所有需要同步的会话
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

    // 这里应该调用后端的同步接口（如果有的话）
    // 目前只是一个示例占位
    for (const [conversationId, versionRange] of conversationMap) {
      console.log('执行同步任务:', conversationId, versionRange)
    }
  }
}

export default new MessageBusiness()
