import { and, eq, gte, lte } from 'drizzle-orm'
import { chatUserConversations } from 'mainModule/database/tables/chat/user-conversation'
import { BaseService } from '../base'
import type {
  DBCreateUserConversationReq,
  DBCreateUserConversationRes,
  DBBatchCreateUserConversationsReq,
  DBBatchCreateUserConversationsRes,
  DBUpdateReadSeqReq,
  DBUpdateReadSeqRes,
  DBUpdateSettingsReq,
  DBUpdateSettingsRes,
  DBGetUserConversationsReq,
  DBGetUserConversationsRes,
  DBGetAllUserConversationsReq,
  DBGetAllUserConversationsRes,
  DBGetUserConversationsByIdsReq,
  DBGetUserConversationsByIdsRes,
  DBGetConversationInfoReq,
  DBGetConversationInfoRes,
  DBGetChatConversationsByVerRangeReq,
  DBGetChatConversationsByVerRangeRes,
} from 'commonModule/type/database/server/chat/user-conversation'

// 用户会话服务
class ChatUserConversation extends BaseService {
  // 创建单个用户会话关系
  async create(req: DBCreateUserConversationReq): Promise<DBCreateUserConversationRes> {
    await this.db.insert(chatUserConversations).values(req.userConversationData).run()
    return { success: true }
  }

  // 批量创建用户会话关系（支持插入或更新）
  async batchCreate(req: DBBatchCreateUserConversationsReq): Promise<DBBatchCreateUserConversationsRes> {
    const { userConversations } = req
    if (userConversations.length === 0)
      return { success: true }

    // 使用插入或更新的方式来避免唯一约束冲突
    for (const userConversation of userConversations) {
      await this.db
        .insert(chatUserConversations)
        .values(userConversation)
        .onConflictDoUpdate({
          target: [chatUserConversations.userId, chatUserConversations.conversationId],
          set: {
            // lastMessage 已移至 ChatConversationMeta 表
            isHidden: userConversation.isHidden,
            isPinned: userConversation.isPinned,
            isMuted: userConversation.isMuted,
            userReadSeq: userConversation.userReadSeq,
            version: userConversation.version,
            updatedAt: userConversation.updatedAt,
          },
        })
        .run()
    }
    return { success: true }
  }

  // 更新用户的已读游标
   async updateReadSeq(req: DBUpdateReadSeqReq): Promise<DBUpdateReadSeqRes> {
    await this.db
      .update(chatUserConversations)
      .set({
        userReadSeq: req.readSeq,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(and(
        eq(chatUserConversations.userId, req.userId as any),
        eq(chatUserConversations.conversationId, req.conversationId as any),
      ))
      .run()
    return { success: true }
  }

  // 更新会话设置（置顶、免打扰等）
   async updateSettings(req: DBUpdateSettingsReq): Promise<DBUpdateSettingsRes> {
    const { userId, conversationId, settings } = req
    const updateData: any = {
      updatedAt: Math.floor(Date.now() / 1000),
    }

    if (settings.isPinned !== undefined) {
      updateData.isPinned = settings.isPinned ? 1 : 0
    }

    if (settings.isMuted !== undefined) {
      updateData.isMuted = settings.isMuted ? 1 : 0
    }

    if (settings.isHidden !== undefined) {
      updateData.isHidden = settings.isHidden ? 1 : 0
    }

    await this.db
      .update(chatUserConversations)
      .set(updateData)
      .where(and(
        eq(chatUserConversations.userId, userId as any),
        eq(chatUserConversations.conversationId, conversationId as any),
      ))
      .run()
    return { success: true }
  }

  // 获取用户的基础会话数据（仅数据访问，不含业务逻辑）
   async getUserConversations(req: DBGetUserConversationsReq): Promise<DBGetUserConversationsRes> {
    const { userId, params } = req
    const { page = 1, limit = 50, offset } = params
    const actualOffset = offset !== undefined ? offset : (page - 1) * limit

    // 获取用户的未隐藏会话列表（支持分页）
    const conversations = await this.db.select().from(chatUserConversations).where(and(
      eq(chatUserConversations.userId, userId as any),
      eq(chatUserConversations.isHidden, 0 as any),
    )).orderBy(chatUserConversations.updatedAt, 'desc').limit(limit).offset(actualOffset).all()

    return { conversations }
  }

  // 获取用户所有未隐藏的会话（用于排序和分页）
   async getAllUserConversations(req: DBGetAllUserConversationsReq): Promise<DBGetAllUserConversationsRes> {
    const conversations = await this.db.select().from(chatUserConversations).where(and(
      eq(chatUserConversations.userId, req.userId as any),
      eq(chatUserConversations.isHidden, 0 as any),
    )).orderBy(chatUserConversations.updatedAt, 'desc').all()

    return { conversations }
  }

  // 根据会话ID列表批量获取用户的会话设置
   async getUserConversationsByIds(req: DBGetUserConversationsByIdsReq): Promise<DBGetUserConversationsByIdsRes> {
    const { userId, conversationIds } = req
    if (conversationIds.length === 0)
      return { conversations: [] }

    const conversations = await this.db.select().from(chatUserConversations).where(and(
      eq(chatUserConversations.userId, userId as any),
      inArray(chatUserConversations.conversationId, conversationIds as any),
    )).all()

    return { conversations }
  }

  // 根据会话ID获取会话信息
   async getConversationInfo(req: DBGetConversationInfoReq): Promise<DBGetConversationInfoRes> {
    const userId = String(req.header.userId)
    const conversationId = req.params.conversationId
    const conversationInfo = await this.db.select().from(chatUserConversations).where(and(
      eq(chatUserConversations.userId, userId as any),
      eq(chatUserConversations.conversationId, conversationId as any),
    )).get()

    return { conversationInfo }
  }

  // 按版本范围获取会话设置（用于数据同步）
   async getChatConversationsByVerRange(req: DBGetChatConversationsByVerRangeReq): Promise<DBGetChatConversationsByVerRangeRes> {
    const userId = String(req.header.userId)
    const { startVersion, endVersion } = req.params
    const conversations = await this.db.select().from(chatUserConversations).where(and(
      eq(chatUserConversations.userId, userId as any),
      and(
        gte(chatUserConversations.version, startVersion as any),
        lte(chatUserConversations.version, endVersion as any),
      ),
    )).orderBy(chatUserConversations.version, 'asc').all()

    return { conversations }
  }

  // LastMessage 相关方法已移至 dBServiceChatConversation
  // 如需更新最后消息，请使用 dBServiceChatConversation.updateLastMessage
}

// 导出用户会话服务实例
export default new ChatUserConversation()
