import { eq, inArray } from 'drizzle-orm'
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

  // 批量创建会话（支持插入或更新）
  static async batchCreate(conversations: any[]) {
    if (conversations.length === 0)
      return

    // 使用插入或更新的方式来避免唯一约束冲突
    for (const conversation of conversations) {
      await this.db
        .insert(chatConversations)
        .values(conversation)
        .onConflictDoUpdate({
          target: chatConversations.conversationId,
          set: {
            type: conversation.type,
            maxSeq: conversation.maxSeq,
            lastMessage: conversation.lastMessage,
            version: conversation.version,
            updatedAt: conversation.updatedAt,
          },
        })
        .run()
    }
  }

  // 根据会话ID列表批量获取会话元数据（包含最后消息）
  static async getConversationsByIds(conversationIds: string[]) {
    if (conversationIds.length === 0)
      return []
    return await this.db.select().from(chatConversations).where(inArray(chatConversations.conversationId as any, conversationIds as any)).all()
  }

  // 根据会话ID获取单个会话元数据
  static async getConversationById(conversationId: string) {
    return await this.db.select().from(chatConversations).where(eq(chatConversations.conversationId as any, conversationId as any)).get()
  }

  // 更新会话的最后消息
  static async updateLastMessage(conversationId: string, lastMessage: string, maxSeq?: number) {
    const updateData: any = {
      lastMessage,
      updatedAt: new Date().toISOString(),
    }
    if (maxSeq !== undefined) {
      updateData.maxSeq = maxSeq
    }
    return await this.db.update(chatConversations)
      .set(updateData)
      .where(eq(chatConversations.conversationId as any, conversationId))
      .run()
  }
}
