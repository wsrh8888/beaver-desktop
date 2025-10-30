import dbManager from '../../db'
import { chatConversations } from '../../tables/chat/chat'

// 聊天会话服务
export class ChatConversationService {
  static get db() {
    return dbManager.db
  }

  // 创建单个会话
  static async create(conversationData: any) {
    return await this.db.insert(chatConversations).values(conversationData).run()
  }

  // 批量创建会话（调用create方法）
  static async batchCreate(conversations: any[]) {
    if (conversations.length === 0)
      return

    for (const conversation of conversations) {
      await this.create(conversation)
    }
  }
}
