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

  // 获取聚合后的最近聊天列表（包含会话元数据）
  static async getAggregatedRecentChatList(header: any, params: IRecentChatReq) {
    const userId = String(header.userId) // 确保userId是字符串类型
    const { page = 1, limit = 50 } = params

    // 计算分页偏移量
    const offset = (page - 1) * limit

    // 获取用户的未隐藏会话列表（支持分页）
    const conversations = await this.db.select().from(chatUserConversations).where(and(eq(chatUserConversations.userId, userId as any), eq(chatUserConversations.isHidden, 0 as any))).orderBy(chatUserConversations.updatedAt, 'desc').limit(limit).offset(offset).all()

    if (conversations.length === 0) {
      return {
        count: 0,
        list: [],
      }
    }

    // 获取对应的会话元数据
    const conversationIds = conversations.map((conv: any) => conv.conversationId)
    console.log('[DEBUG] Conversation IDs to query:', conversationIds)

    const conversationMetas = await ChatConversationService.getConversationsByIds(conversationIds)
    console.log('[DEBUG] Conversation metas returned:', conversationMetas.length, conversationMetas)

    // 创建会话元数据的映射
    const metaMap = new Map()
    conversationMetas.forEach((meta: any) => {
      console.log('[DEBUG] Meta object:', meta)
      console.log('[DEBUG] Meta lastMessage:', meta?.lastMessage)
      metaMap.set(meta.conversationId, meta)
    })

    // 提取私聊会话中的好友ID列表
    const privateChatFriendIds: string[] = []
    conversations.forEach((conv: any) => {
      if (conv.conversationId.startsWith('private_')) {
        const parts = conv.conversationId.split('_')
        if (parts.length >= 3) {
          // 找出对方用户ID（排除当前用户ID）
          const userId1 = parts[1]
          const userId2 = parts[2]
          if (userId1 === userId) {
            privateChatFriendIds.push(userId2)
          }
          else if (userId2 === userId) {
            privateChatFriendIds.push(userId1)
          }
        }
      }
    })

    // 获取好友详细信息（包含用户信息和备注）
    const friendDetailsMap = await FriendService.getFriendDetails(userId, privateChatFriendIds)

    // 聚合数据 - 使用蛇形命名法以匹配后端API格式
    const list = conversations.map((conv: any) => {
      const meta = metaMap.get(conv.conversationId)
      let avatar = ''
      let nickname = '未知用户'
      let notice = ''

      // 只有私聊会话才有好友详细信息
      if (conv.conversationId.startsWith('private_')) {
        const parts = conv.conversationId.split('_')
        if (parts.length >= 3) {
          const userId1 = parts[1]
          const userId2 = parts[2]
          const friendId = (userId1 === userId) ? userId2 : userId1

          // 从好友详细信息中获取数据
          const friendDetail = friendDetailsMap.get(friendId)
          if (friendDetail) {
            avatar = friendDetail.avatar
            nickname = friendDetail.nickname
            notice = friendDetail.notice
          }
        }
      }

      const msgPreview = meta?.lastMessage || ''
      console.log('[DEBUG] For conversation', conv.conversationId, 'meta:', meta, 'msgPreview:', msgPreview)

      return {
        conversationId: conv.conversationId,
        avatar,
        nickname,
        msg_preview: msgPreview,
        update_at: conv.updatedAt.toString(), // 数据库中已经是格式化的字符串
        is_top: conv.isPinned === 1,
        chatType: meta?.type || 1,
        notice,
        version: conv.version, // 会话配置版本号
      }
    })

    return {
      count: conversations.length,
      list,
    }
  }

  // 根据会话ID获取会话信息
  static async getConversationInfo(header: any, params: any) {
    const userId = String(header.userId)
    const conversationId = params.conversationId
    return await this.db.select().from(chatUserConversations).where(and(
      eq(chatUserConversations.userId, userId as any),
      eq(chatUserConversations.conversationId, conversationId as any),
      eq(chatUserConversations.isHidden, 0 as any),
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
