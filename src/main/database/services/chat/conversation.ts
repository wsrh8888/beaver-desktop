import { eq, inArray } from 'drizzle-orm'
import { chatConversations } from 'mainModule/database/tables/chat/conversation'
import dbManager from '../../db'

// 聊天会话服务
export class ChatConversationService {
  static get db() {
    return dbManager.db
  }

  // 创建单个会话
  static async create(conversationData: any) {
    return await this.db.insert(chatConversations).values(conversationData).run()
  }

  // upsert单个会话（插入或更新）
  static async upsert(conversationData: any) {
    // 处理字段名映射：API返回的 createAt/updateAt 映射到数据库的 createdAt/updatedAt
    const dbData = {
      conversationId: conversationData.conversationId,
      type: conversationData.type,
      maxSeq: conversationData.maxSeq,
      lastMessage: conversationData.lastMessage,
      version: conversationData.version,
      createdAt: conversationData.createAt, // API返回的是 createAt
      updatedAt: conversationData.updateAt, // API返回的是 updateAt
    }

    return await this.db
      .insert(chatConversations)
      .values(dbData)
      .onConflictDoUpdate({
        target: chatConversations.conversationId,
        set: {
          type: dbData.type,
          maxSeq: dbData.maxSeq,
          lastMessage: dbData.lastMessage,
          version: dbData.version,
          updatedAt: dbData.updatedAt,
        },
      })
      .run()
  }

  // 批量创建会话（支持插入或更新）
  static async batchCreate(conversations: any[]) {
    if (conversations.length === 0)
      return

    // 使用插入或更新的方式来避免唯一约束冲突
    for (const conversation of conversations) {
      // 处理字段名映射：API返回的 createAt/updateAt 映射到数据库的 createdAt/updatedAt
      const dbData = {
        conversationId: conversation.conversationId,
        type: conversation.type,
        maxSeq: conversation.maxSeq,
        lastMessage: conversation.lastMessage,
        version: conversation.version,
        createdAt: conversation.createAt, // API返回的是 createAt
        updatedAt: conversation.updateAt, // API返回的是 updateAt
      }

      await this.db
        .insert(chatConversations)
        .values(dbData)
        .onConflictDoUpdate({
          target: chatConversations.conversationId,
          set: {
            type: dbData.type,
            maxSeq: dbData.maxSeq,
            lastMessage: dbData.lastMessage,
            version: dbData.version,
            updatedAt: dbData.updatedAt,
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
