import { eq, inArray } from 'drizzle-orm'
import { chatConversations } from 'mainModule/database/tables/chat/conversation'
import { BaseService } from '../base'
import type {
  DBCreateConversationReq,
  DBUpsertConversationReq,
  DBBatchCreateConversationsReq,
  DBGetAllConversationsReq,
  DBGetAllConversationsRes,
  DBGetConversationsByIdsReq,
  DBGetConversationsByIdsRes,
  DBGetConversationByIdReq,
  DBGetConversationByIdRes,
  DBGetConversationsByTypeReq,
  DBGetConversationsByTypeRes,
  DBUpdateLastMessageReq,
} from 'commonModule/type/database/server/chat/conversation'

// 聊天会话服务
class ChatConversation extends BaseService {
  /**
   * @description 创建单个会话
   */
  async create(req: DBCreateConversationReq): Promise<void> {
    await this.db.insert(chatConversations).values(req).run()
  }

  /**
   * @description upsert单个会话（插入或更新）
   */
  async upsert(req: DBUpsertConversationReq): Promise<void> {
    // 处理字段名映射：API返回的 createAt/updateAt 映射到数据库的 createdAt/updatedAt
    const dbData = {
      conversationId: req.conversationId,
      type: req.type,
      maxSeq: req.maxSeq,
      lastMessage: req.lastMessage,
      version: req.version,
      createdAt: req.createAt, // API返回的是 createAt
      updatedAt: req.updateAt, // API返回的是 updateAt
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

  /**
   * @description 批量创建会话（支持插入或更新）
   */
  async batchCreate(req: DBBatchCreateConversationsReq): Promise<void> {
    if (req.conversations.length === 0)
      return

    // 使用插入或更新的方式来避免唯一约束冲突
    for (const conversation of req.conversations) {
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

  /**
   * @description 获取所有会话（本地数据库场景，支持分页）
   */
  async getAllConversations(req: DBGetAllConversationsReq): Promise<DBGetAllConversationsRes> {
    const { page = 1, limit } = req

    let query = this.db.select().from(chatConversations)

    // 如果指定了limit，则应用分页
    if (limit) {
      const offset = (page - 1) * limit
      query = query.limit(limit).offset(offset)
    }

    return await query.all()
  }

  /**
   * @description 根据会话ID列表批量获取会话元数据（包含最后消息）
   */
  async getConversationsByIds(req: DBGetConversationsByIdsReq): Promise<DBGetConversationsByIdsRes> {
    if (req.conversationIds.length === 0)
      return []
    const conversations = await this.db.select().from(chatConversations).where(inArray(chatConversations.conversationId as any, req.conversationIds as any)).all()
    return conversations
  }

  /**
   * @description 根据会话ID获取单个会话元数据
   */
  async getConversationById(req: DBGetConversationByIdReq): Promise<DBGetConversationByIdRes> {
    const conversation = await this.db.select().from(chatConversations).where(eq(chatConversations.conversationId as any, req.conversationId as any)).get()
    return { conversation }
  }

  /**
   * @description 根据类型获取会话（纯数据库查询）
   */
  async getConversationsByType(req: DBGetConversationsByTypeReq): Promise<DBGetConversationsByTypeRes> {
    const conversations = await this.db.select().from(chatConversations).where(eq(chatConversations.type as any, req.type as any)).all()
    return conversations
  }

  /**
   * @description 更新会话的最后消息
   */
  async updateLastMessage(req: DBUpdateLastMessageReq): Promise<void> {
    const updateData: any = {
      lastMessage: req.lastMessage,
      updatedAt: Math.floor(Date.now() / 1000), // 使用秒级时间戳
    }
    if (req.maxSeq !== undefined) {
      updateData.maxSeq = req.maxSeq
    }
    await this.db.update(chatConversations)
      .set(updateData)
      .where(eq(chatConversations.conversationId as any, req.conversationId))
      .run()
  }
}

// 导出聊天会话服务实例
export default new ChatConversation()
