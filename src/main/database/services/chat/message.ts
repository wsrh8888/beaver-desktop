import dbManager from '../../db'
import { chats } from '../../tables/chat/chat'

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
    const conversationId = params.conversationId
    const page = params.page || 1
    const limit = params.limit || 20
    const offset = (page - 1) * limit
    return await this.db.select().from(chats).where('conversationId', conversationId).where('isDeleted', 0).orderBy('seq', 'desc').limit(limit).offset(offset).all()
  }

  // 获取会话消息总数
  static async getChatHistoryCount(conversationId: string) {
    return await this.db.select().from(chats).where('conversationId', conversationId).where('isDeleted', 0).count()
  }

  // 按序列号范围获取消息（用于数据同步）
  static async getChatMessagesBySeqRange(header: any, params: any) {
    const { startSeq, endSeq, conversationId } = params
    let query = this.db.select().from(chats).where('seq', '>=', startSeq).where('seq', '<=', endSeq).where('isDeleted', 0).orderBy('seq', 'asc')

    if (conversationId) {
      query = query.where('conversationId', conversationId)
    }

    return await query.all()
  }
}
