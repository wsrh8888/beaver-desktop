import type {
  IRecentChatReq,
  IRecentChatRes,
  ICreateConversationReq,
  IConversationInfoReq,
  IConversationInfoRes
} from 'commonModule/type/ajax/chat'
import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'
import { FriendService } from 'mainModule/database/services/friend/friend'
import { GroupService } from 'mainModule/database/services/group/group'

/**
 * 会话业务逻辑
 * 对应 chat_conversations 表
 * 负责会话的创建、更新、查询等业务逻辑
 */
export class ConversationBusiness {
  /**
   * 获取聚合后的最近聊天列表
   */
  async getAggregatedRecentChatList(header: ICommonHeader, params: IRecentChatReq): Promise<IRecentChatRes> {
    const { userId } = header
    const { page = 1, limit = 50 } = params

    // 1. 先获取用户会话设置，过滤掉隐藏的会话
    const userConversations = await ChatUserConversationService.getAllUserConversations(userId)
    const visibleUserConversations = userConversations.filter((uc: any) => uc.isHidden === 0)

    if (visibleUserConversations.length === 0) {
      return {
        count: 0,
        list: [],
      }
    }

    // 2. 根据会话ID获取会话元数据（以 conversation_metas 为主，排序时间来源）
    const conversationIds = visibleUserConversations.map((uc: any) => uc.conversationId)
    const conversationMetas = await ChatConversationService.getConversationsByIds(conversationIds)
    const metaMap = new Map()
    conversationMetas.forEach((meta: any) => {
      metaMap.set(meta.conversationId, meta)
    })

    // 3. 合并数据：合并用户设置和会话元数据
    const mergedConversations = visibleUserConversations
      .map((uc: any) => {
        const meta = metaMap.get(uc.conversationId)
        // 如果会话元数据不存在，跳过（会话可能已删除）
        if (!meta) {
          return null
        }
        return {
          ...meta, // 以 conversation_metas 为主，包含 updatedAt（消息时间）
          isPinned: uc.isPinned || 0,
          isMuted: uc.isMuted || 0,
          userReadSeq: uc.userReadSeq || 0,
          version: uc.version || 0,
        }
      })
      .filter((conv: any) => conv !== null) // 过滤掉已删除的会话

    // 4. 排序：置顶优先，然后按消息时间（conversation_metas.updatedAt）排序
    mergedConversations.sort((a: any, b: any) => {
      // 置顶优先
      if (a.isPinned !== b.isPinned) {
        return b.isPinned - a.isPinned
      }
      // 然后按消息时间倒序（conversation_metas.updatedAt）
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    })

    // 5. 应用用户传入的分页参数
    const offset = (page - 1) * limit
    const paginatedConversations = mergedConversations.slice(offset, offset + limit)

    // 6. 获取好友信息（私聊需要）和群组信息（群聊需要）
    const privateChatFriendIds: string[] = []
    const groupIds: string[] = []
    
    paginatedConversations.forEach((conv: any) => {
      if (conv.type === 1) { // 私聊
        const parts = conv.conversationId.split('_')
        if (parts.length >= 3) {
          const userId1 = parts[1]
          const userId2 = parts[2]
          if (userId1 === userId) {
            privateChatFriendIds.push(userId2)
          } else if (userId2 === userId) {
            privateChatFriendIds.push(userId1)
          }
        }
      } else if (conv.type === 2) { // 群聊
        // conversationId格式: group_${groupId}
        const parts = conv.conversationId.split('_')
        if (parts.length >= 2 && parts[0] === 'group') {
          groupIds.push(parts.slice(1).join('_')) // 支持groupId中包含下划线的情况
        }
      }
    })
    
    const friendDetailsMap = await FriendService.getFriendDetails(userId, privateChatFriendIds)
    const groupDetails = await GroupService.getGroupsByUuids(groupIds)
    const groupDetailsMap = new Map()
    groupDetails.forEach((group: any) => {
      groupDetailsMap.set(group.groupId, group)
    })

    // 7. 业务逻辑处理：数据聚合、未读消息计算等
    const list = paginatedConversations.map((conv: any): IConversationInfoRes => {
      // 业务逻辑：计算未读消息数量
      const unreadCount = Math.max(0, (conv.maxSeq || 0) - (conv.userReadSeq || 0))

      // 业务逻辑：获取会话显示信息
      let avatar = ''
      let nickname = ''
      let notice = ''

      if (conv.type === 1) { // 私聊：从好友信息获取显示数据
        const parts = conv.conversationId.split('_')
        if (parts.length >= 3) {
          const userId1 = parts[1]
          const userId2 = parts[2]
          const friendId = (userId1 === userId) ? userId2 : userId1

          const friendDetail = friendDetailsMap.get(friendId)
          if (friendDetail) {
            avatar = friendDetail?.avatar || ''
            nickname = friendDetail?.nickname || ''
            notice = friendDetail.notice || ''
          }
        }
      } else if (conv.type === 2) { // 群聊：从群组信息获取显示数据
        const parts = conv.conversationId.split('_')
        if (parts.length >= 2 && parts[0] === 'group') {
          const groupId = parts.slice(1).join('_') // 支持groupId中包含下划线的情况
          const groupDetail = groupDetailsMap.get(groupId)
          if (groupDetail) {
            avatar = groupDetail.avatar || ''
            nickname = groupDetail.title || ''
            notice = groupDetail.notice || ''
          }
        }
      }

      return {
        conversationId: conv.conversationId,
        avatar,
        nickname,
        msg_preview: conv.lastMessage || '',
        update_at: conv.updatedAt?.toString() || '',
        is_top: conv.isPinned === 1,
        chatType: conv.type || 1,
        notice,
        version: conv.version || 0,
        unread_count: unreadCount,
        is_muted: conv.isMuted === 1,
      }
    })

    return {
      count: mergedConversations.length, // 返回排序后的总数
      list,
    }
  }

  /**
   * 更新会话的最后消息
   */
  async updateLastMessage(conversationId: string, lastMessage: string, maxSeq?: number): Promise<void> {
    // 业务规则：消息不能为空
    if (!lastMessage?.trim()) {
      throw new Error('消息内容不能为空')
    }

    // 调用服务层
    await ChatConversationService.updateLastMessage(conversationId, lastMessage, maxSeq)
  }
}

// 导出单例实例
export const conversationBusiness = new ConversationBusiness()
