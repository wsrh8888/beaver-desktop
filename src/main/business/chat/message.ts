import type {
  IChatHistoryReq,
  IChatHistoryRes,
  IChatMessageVerRangeRes
} from 'commonModule/type/ajax/chat'
import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { MessageService } from 'mainModule/database/services/chat/message'
import { UserService } from 'mainModule/database/services/user/user'

/**
 * 消息业务逻辑
 * 对应 chat_messages 表
 * 负责消息的处理、状态更新等业务逻辑
 */
export class MessageBusiness {
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
}

// 导出单例实例
export const messageBusiness = new MessageBusiness()
