import { BaseBusiness, type QueueItem } from '../base/base'
import { getUserConversationSettingsListByIdsApi } from 'mainModule/api/chat'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'

/**
 * 用户会话同步队列项
 */
interface UserConversationSyncItem extends QueueItem {
  userId: string
  conversationId?: string
  minVersion: number
  maxVersion: number
}

/**
 * 用户会话业务逻辑
 * 对应 chat_user_conversations 表
 * 负责用户会话列表、未读消息、设置等业务逻辑
 */
export class UserConversationBusiness extends BaseBusiness<UserConversationSyncItem> {
  protected readonly businessName = 'UserConversationBusiness'

  constructor() {
    super({
      queueSizeLimit: 25, // 用户会话同步请求适中
      delayMs: 1000,
    })
  }




  /**
   * 通过版本同步特定用户会话数据
   * 直接同步指定的 conversationId，提高效率
   */
  async syncUserConversationByVersion(userId: string, conversationId: string, version: number) {
    try {
      // 获取指定会话的设置数据
      const response = await getUserConversationSettingsListByIdsApi({
        conversationIds: [conversationId],
      })

      if (response.result?.userConversationSettings && response.result.userConversationSettings.length > 0) {
        const userConversationData = response.result.userConversationSettings[0]

        // 更新或插入用户会话关系数据
        const userConversation = {
          userId: userConversationData.userId,
          conversationId: userConversationData.conversationId,
          isHidden: userConversationData.isHidden ? 1 : 0,
          isPinned: userConversationData.isPinned ? 1 : 0,
          isMuted: userConversationData.isMuted ? 1 : 0,
          userReadSeq: userConversationData.userReadSeq,
          version: userConversationData.version,
          createdAt: userConversationData.createAt,
          updatedAt: userConversationData.updateAt,
        }

        // 使用插入或更新的方式来同步单个用户会话
        await ChatUserConversationService.batchCreate([userConversation])

        console.log(`用户会话同步成功: userId=${userId}, conversationId=${conversationId}, version=${version}`)
      } else {
        console.log(`用户会话已同步: userId=${userId}, conversationId=${conversationId}, version=${version}`)
      }

    } catch (error) {
      console.error('通过版本同步特定用户会话失败:', error)
    }
  }

  /**
   * 处理用户会话表的更新通知
   * 将同步请求加入队列，1秒后批量处理
   */
  async handleTableUpdates(userId: string, conversationId: string, version: number) {
    this.addToQueue({
      key: `${userId}:${conversationId}`,
      data: { userId, conversationId, version },
      timestamp: Date.now(),
      userId,
      conversationId,
      minVersion: version,
      maxVersion: version,
    })
  }

  /**
   * 批量处理用户会话同步请求
   */
  protected async processBatchRequests(items: UserConversationSyncItem[]): Promise<void> {
    // 按 (userId, conversationId) 组合聚合最新版本
    const syncMap = new Map<string, { userId: string, conversationId: string, version: number }>()

    for (const item of items) {
      // 使用 userId 和 conversationId 的组合作为键
      const key = `${item.userId}:${item.conversationId}`
      const existing = syncMap.get(key)

      if (existing) {
        // 保留最新版本
        existing.version = Math.max(existing.version, item.maxVersion)
      } else {
        syncMap.set(key, {
          userId: item.userId,
          conversationId: item.conversationId!,
          version: item.maxVersion,
        })
      }
    }

    // 批量同步用户会话数据
    for (const syncItem of syncMap.values()) {
      await this.syncUserConversationByVersion(
        syncItem.userId,
        syncItem.conversationId,
        syncItem.version
      )
    }

    // 发送表更新通知
    const userIds = Array.from(new Set(Array.from(syncMap.values()).map(item => item.userId)))
    this.notifyUserConversationTableUpdate(userIds)
  }

  /**
   * 发送用户会话设置表更新通知
   */
  private notifyUserConversationTableUpdate(userIds: string[]) {
    // TODO: 实现前端UI更新通知
    console.log('用户会话表更新通知:', userIds)
  }


}

// 导出单例实例
export const userConversationBusiness = new UserConversationBusiness()
