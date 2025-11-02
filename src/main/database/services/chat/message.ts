import { eq, gte, lte } from 'drizzle-orm'
import dbManager from '../../db'
import { chats } from '../../tables/chat/chat'
import { UserService } from '../user/user'

// 消息服务
export class MessageService {
  static get db() {
    return dbManager.db
  }

  // 创建单条消息
  static async create(messageData: any) {
    return await this.db.insert(chats).values(messageData).run()
  }

  // 批量创建消息（调用create方法）
  static async batchCreate(messages: any[]) {
    if (messages.length === 0)
      return

    for (const message of messages) {
      await this.create(message)
    }
  }

  // 获取会话的历史消息
  static async getChatHistory(header: any, params: any) {
    // 前端可能传递 conversation 或 conversationId
    const conversationId = params.conversationId || params.conversation
    const page = params.page || 1
    const limit = params.limit || 20
    const offset = (page - 1) * limit
    const currentUserId = String(header.userId) // 当前用户ID

    console.log('[DEBUG] getChatHistory params:', { conversationId, page, limit, offset, currentUserId })

    // 获取消息列表
    const messages = await this.db.select().from(chats).where(eq(chats.conversationId, conversationId)).orderBy(chats.seq, 'desc').limit(limit + 1).offset(offset).all()

    console.log('[DEBUG] Found messages:', messages.length, 'for conversationId:', conversationId)

    // 判断是否还有更多数据（返回 limit+1 条，如果超过 limit 条说明有更多数据）
    const hasMore = messages.length > limit
    const actualMessages = hasMore ? messages.slice(0, limit) : messages

    // 获取所有发送者ID（排除空值）
    const senderIds = [...new Set(actualMessages.map((m: any) => m.sendUserId).filter((id: string) => id && id.trim()))]

    // 获取发送者信息
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
        console.warn('[DEBUG] Failed to get sender details:', error)
      }
    }

    // 转换数据格式以匹配前端期望的API响应格式
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
        status: 0, // 默认正常状态
      }
    })

    return {
      count: formattedMessages.length, // 当前页的数量
      list: formattedMessages,
    }
  }

  // 按序列号范围获取消息（用于数据同步）
  static async getChatMessagesBySeqRange(header: any, params: any) {
    const { startSeq, endSeq, conversationId } = params
    let query = this.db.select().from(chats).where(gte(chats.seq, startSeq)).where(lte(chats.seq, endSeq)).orderBy(chats.seq, 'asc')

    if (conversationId) {
      query = query.where(eq(chats.conversationId, conversationId))
    }

    return await query.all()
  }
}
