import type {
  IRecentChatReq,
  IRecentChatRes,
  IConversationInfoRes
} from 'commonModule/type/ajax/chat'
import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IConversationItem } from 'commonModule/type/pinia/conversation'
import { BaseBusiness, type QueueItem } from '../base/base'
import { getConversationsListByIdsApi } from 'mainModule/api/chat'
import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'
import { FriendService } from 'mainModule/database/services/friend/friend'
import { GroupService } from 'mainModule/database/services/group/group'
import { NotificationModule, NotificationChatCommand } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'

/**
 * 会话同步队列项
 */
interface ConversationSyncItem extends QueueItem {
  conversationId: string
  minVersion: number
  maxVersion: number
}

/**
 * 会话业务逻辑
 * 对应 chat_conversations 表
 * 负责会话的创建、更新、查询等业务逻辑
 */
export class ConversationBusiness extends BaseBusiness<ConversationSyncItem> {
  protected readonly businessName = 'ConversationBusiness'

  constructor() {
    super({
      queueSizeLimit: 30, // 会话同步请求较少
      delayMs: 1000,
    })
  }
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
        msgPreview: conv.lastMessage || '',
        updatedAt: conv.updatedAt, // 原始时间戳（秒级），前端负责格式化
        isTop: conv.isPinned === 1,
        chatType: conv.type || 1,
        notice,
        version: conv.version || 0,
        unreadCount: unreadCount,
        isMuted: conv.isMuted === 1,
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

  /**
   * 获取单个会话信息（包含用户设置和会话元数据）
   */
  async getConversationInfo(header: ICommonHeader, params: any): Promise<IConversationItem | null> {
    const { userId } = header
    const { conversationId } = params

    // 1. 获取用户会话设置
    const userConversation = await ChatUserConversationService.getConversationInfo(header, params)
    if (!userConversation) {
      return null
    }

    // 2. 获取会话元数据
    const conversationMetas = await ChatConversationService.getConversationsByIds([conversationId])
    if (conversationMetas.length === 0) {
      return null
    }
    const meta = conversationMetas[0]

    // 3. 获取头像和昵称信息
    let avatar = ''
    let nickname = ''
    let notice = ''

    if (meta.type === 1) { // 私聊：从好友信息获取显示数据
      const parts = conversationId.split('_')
      if (parts.length >= 3) {
        const userId1 = parts[1]
        const userId2 = parts[2]
        const friendId = (userId1 === userId) ? userId2 : userId1

        const friendDetailsMap = await FriendService.getFriendDetails(userId, [friendId])
        const friendDetail = friendDetailsMap.get(friendId)
        if (friendDetail) {
          avatar = friendDetail?.avatar || ''
          nickname = friendDetail?.nickname || ''
          notice = friendDetail.notice || ''
        }
      }
    } else if (meta.type === 2) { // 群聊：从群组信息获取显示数据
      const parts = conversationId.split('_')
      if (parts.length >= 2 && parts[0] === 'group') {
        const groupId = parts.slice(1).join('_') // 支持groupId中包含下划线的情况
        const groupDetails = await GroupService.getGroupsByUuids([groupId])
        if (groupDetails.length > 0) {
          const groupDetail = groupDetails[0]
          avatar = groupDetail.avatar || ''
          nickname = groupDetail.title || ''
          notice = groupDetail.notice || ''
        }
      }
    }

    // 4. 合并数据
    const mergedConversation: IConversationItem = {
      conversationId: userConversation.conversationId,
      avatar,
      nickname,
      msgPreview: meta.lastMessage || '',
      updatedAt: meta.updatedAt || 0,
      isTop: userConversation.isPinned === 1,
      chatType: meta.type || 1,
      notice,
      version: userConversation.version || 0,
      unreadCount: 0, // 暂时设为0，后续可以计算
      isMuted: userConversation.isMuted === 1,
    }

    return mergedConversation
  }

  /**
   * 处理来自WS的会话更新
   */
  async handleWSConversationUpdates(updates: any[]) {
    if (updates.length === 0) return

    // 检查参数类型：如果是字符串数组（conversationIds），则从服务端同步
    if (typeof updates[0] === 'string') {
      await this.syncConversationsFromServer(updates as string[])
      return
    }

    // 批量更新数据库（兼容旧格式）
    for (const update of updates) {
      switch (update.operation) {
        case 'conversation_create':
          await ChatConversationService.create(update.data)
          break
        case 'conversation_update':
          await ChatConversationService.upsert({ conversationId: update.conversationId, ...update.data })
          break
      }
    }

    // 发送表更新通知
    await this.notifyConversationTableUpdate(updates)
  }

  /**
   * 从服务端同步会话数据 - 兼容旧方法
   */
  async syncConversationsFromServer(conversationIds: string[]) {
    for (const conversationId of conversationIds) {
      await this.syncConversationsByVersionRange(conversationId, 0, Number.MAX_SAFE_INTEGER)
    }
  }

  /**
   * 通过版本区间从服务端同步会话数据
   * 直接使用WS推送的版本范围，不查询本地数据
   */
  async syncConversationsByVersionRange(conversationId: string, minVersion: number, maxVersion: number) {
    try {
      // 直接使用WS推送的版本范围
      // 如果需要同步特定版本范围的数据，这里可以根据版本号来获取

      // 调用现有的getConversationsListByIdsApi获取会话数据
      const response = await getConversationsListByIdsApi({
        conversationIds: [conversationId],
      })

      if (response.result?.conversations && response.result.conversations.length > 0) {
        const conversationData = response.result.conversations[0]

        // 更新本地数据库
        await ChatConversationService.upsert(conversationData)

        console.log(`会话同步成功: conversationId=${conversationId}, versionRange=[${minVersion}, ${maxVersion}]`)
      } else {
        console.log(`会话未找到: conversationId=${conversationId}`)
      }

    } catch (error) {
      console.error('通过版本区间同步会话失败:', error)
    }
  }

  /**
   * 通过单个版本号从服务端同步会话数据
   * 将同步请求加入队列，1秒后批量处理
   */
  async syncConversationByVersion(conversationId: string, version: number) {
    this.addToQueue({
      key: conversationId,
      data: { conversationId, version },
      timestamp: Date.now(),
      conversationId,
      minVersion: version,
      maxVersion: version,
    })
  }

  /**
   * 批量处理会话同步请求
   */
  protected async processBatchRequests(items: ConversationSyncItem[]): Promise<void> {
    // 按 conversationId 聚合版本范围
    const conversationMap = new Map<string, { minVersion: number, maxVersion: number }>()

    for (const item of items) {
      const existing = conversationMap.get(item.conversationId)
      if (existing) {
        existing.minVersion = Math.min(existing.minVersion, item.minVersion)
        existing.maxVersion = Math.max(existing.maxVersion, item.maxVersion)
      } else {
        conversationMap.set(item.conversationId, {
          minVersion: item.minVersion,
          maxVersion: item.maxVersion,
        })
      }
    }

    // 批量同步会话数据
    for (const [conversationId, versionRange] of conversationMap) {
      await this.syncConversationsByVersionRange(conversationId, versionRange.minVersion, versionRange.maxVersion)
    }

    // 发送表更新通知
    const conversationIds = Array.from(conversationMap.keys())
    this.notifyConversationTableUpdate(conversationIds)
  }

  /**
   * 发送会话表更新通知
   */
  private notifyConversationTableUpdate(conversationIds: string[]) {
    sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.CONVERSATION_UPDATE, {
      conversationIds: conversationIds,
    })
  }
}

// 导出单例实例
export const conversationBusiness = new ConversationBusiness()
