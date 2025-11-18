import type { IRecentChatReq } from 'commonModule/type/ajax/chat'
import { and, eq, gte, lte } from 'drizzle-orm'
import { chatUserConversations } from 'mainModule/database/tables/chat/user-conversation'
import dbManager from '../../db'
import { FriendService } from '../friend/friend'
import { ChatConversationService } from './conversation'

// 用户会话服务
export class ChatUserConversationService {
  static get db() {
    return dbManager.db
  }

  // 创建单个用户会话关系
  static async create(userConversationData: any) {
    return await this.db.insert(chatUserConversations).values(userConversationData).run()
  }

  // 批量创建用户会话关系（支持插入或更新）
  static async batchCreate(userConversations: any[]) {
    if (userConversations.length === 0)
      return

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
  }

  // 更新用户的已读游标
  static async updateReadSeq(userId: string, conversationId: string, readSeq: number) {
    return await this.db
      .update(chatUserConversations)
      .set({
        userReadSeq: readSeq,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(and(
        eq(chatUserConversations.userId, userId as any),
        eq(chatUserConversations.conversationId, conversationId as any),
      ))
      .run()
  }

  // 更新会话设置（置顶、免打扰等）
  static async updateSettings(userId: string, conversationId: string, settings: {
    isPinned?: boolean
    isMuted?: boolean
    isHidden?: boolean
  }) {
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

    return await this.db
      .update(chatUserConversations)
      .set(updateData)
      .where(and(
        eq(chatUserConversations.userId, userId as any),
        eq(chatUserConversations.conversationId, conversationId as any),
      ))
      .run()
  }

  // 获取用户的基础会话数据（仅数据访问，不含业务逻辑）
  static async getUserConversations(userId: string, params: { page?: number, limit?: number, offset?: number }) {
    const { page = 1, limit = 50, offset } = params
    const actualOffset = offset !== undefined ? offset : (page - 1) * limit

    // 获取用户的未隐藏会话列表（支持分页）
    return await this.db.select().from(chatUserConversations)
      .where(and(
        eq(chatUserConversations.userId, userId as any),
        eq(chatUserConversations.isHidden, 0 as any)
      ))
      .orderBy(chatUserConversations.updatedAt, 'desc')
      .limit(limit)
      .offset(actualOffset)
      .all()
  }

  // 获取用户所有未隐藏的会话（用于排序和分页）
  static async getAllUserConversations(userId: string) {
    return await this.db.select().from(chatUserConversations)
      .where(and(
        eq(chatUserConversations.userId, userId as any),
        eq(chatUserConversations.isHidden, 0 as any)
      ))
      .orderBy(chatUserConversations.updatedAt, 'desc')
      .all()
  }

  // 根据会话ID列表批量获取用户的会话设置
  static async getUserConversationsByIds(userId: string, conversationIds: string[]) {
    if (conversationIds.length === 0) return []

    return await this.db.select().from(chatUserConversations)
      .where(and(
        eq(chatUserConversations.userId, userId as any),
        inArray(chatUserConversations.conversationId, conversationIds as any)
      ))
      .all()
  }

  // 根据会话ID获取会话信息
  static async getConversationInfo(header: any, params: any) {
    const userId = String(header.userId)
    const conversationId = params.conversationId
    return await this.db.select().from(chatUserConversations).where(and(
      eq(chatUserConversations.userId, userId as any),
      eq(chatUserConversations.conversationId, conversationId as any),
    )).get()
  }

  // 按版本范围获取会话设置（用于数据同步）
  static async getChatConversationsByVerRange(header: any, params: any) {
    const userId = String(header.userId)
    const { startVersion, endVersion } = params
    return await this.db.select().from(chatUserConversations).where(and(
      eq(chatUserConversations.userId, userId as any),
      and(
        gte(chatUserConversations.version, startVersion as any),
        lte(chatUserConversations.version, endVersion as any),
      ),
    )).orderBy(chatUserConversations.version, 'asc').all()
  }

  // LastMessage 相关方法已移至 ChatConversationService
  // 如需更新最后消息，请使用 ChatConversationService.updateLastMessage
}
