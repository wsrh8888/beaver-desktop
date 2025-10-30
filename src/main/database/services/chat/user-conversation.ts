import dbManager from '../../db'
import { chatUserConversations } from '../../tables/chat/chat'

// 用户会话服务
export class ChatUserConversationService {
  static get db() {
    return dbManager.db
  }

  // 创建单个用户会话关系
  static async create(userConversationData: any) {
    return await this.db.insert(chatUserConversations).values(userConversationData).run()
  }

  // 批量创建用户会话关系（调用create方法）
  static async batchCreate(userConversations: any[]) {
    if (userConversations.length === 0)
      return

    for (const userConversation of userConversations) {
      await this.create(userConversation)
    }
  }

  // 获取用户的所有未删除会话
  static async getUserConversations(header: any, _params: any) {
    const userId = header.userId
    return await this.db.select().from(chatUserConversations).where('userId', userId).where('isDeleted', 0).orderBy('updatedAt', 'desc').all()
  }

  // 根据会话ID获取会话信息
  static async getConversationInfo(header: any, params: any) {
    const userId = header.userId
    const conversationId = params.conversationId
    return await this.db.select().from(chatUserConversations).where('userId', userId).where('conversationId', conversationId).where('isDeleted', 0).get()
  }

  // 按版本范围获取会话设置（用于数据同步）
  static async getChatConversationsByVerRange(header: any, params: any) {
    const userId = header.userId
    const { startVersion, endVersion } = params
    return await this.db.select().from(chatUserConversations).where('userId', userId).where('version', '>=', startVersion).where('version', '<=', endVersion).orderBy('version', 'asc').all()
  }

  // 更新会话的最后一条消息
  static async updateConversationLastMessage(userId: string, conversationId: string, lastMessage: string) {
    return await this.db.update(chatUserConversations)
      .set({
        lastMessage,
        updatedAt: new Date().toISOString(),
      })
      .where('userId', userId)
      .where('conversationId', conversationId)
      .run()
  }
}
