import { BaseBusiness, type QueueItem } from '../base/base'
import { getUserConversationSettingsListByIdsApi } from 'mainModule/api/chat'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'
import { NotificationModule, NotificationChatCommand } from 'commonModule/type/preload/notification'

/**
 * 用户会话同步队列项
 */
interface UserConversationSyncItem extends QueueItem {
  userId: string
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
   * 通过版本区间从服务端同步用户会话数据
   * 直接使用WS推送的版本范围，不查询本地数据
   */
  async syncUserConversationsByVersionRange(userId: string, minVersion: number, maxVersion: number) {
    try {
      // 直接使用WS推送的用户ID和版本范围
      // 获取该用户的所有会话设置（当前API设计不支持按版本过滤，所以获取所有）

      // 获取本地用户的所有会话ID
      const localUserConversations = await ChatUserConversationService.getAllUserConversations(userId)
      const conversationIds = localUserConversations.map((uc: any) => uc.conversationId)

      if (conversationIds.length === 0) {
        console.log(`用户会话已同步: userId=${userId}, versionRange=[${minVersion}, ${maxVersion}]`)
        return
      }

      // 调用现有的getUserConversationSettingsListByIdsApi获取用户会话设置数据
      const response = await getUserConversationSettingsListByIdsApi({
        conversationIds,
      })

      if (response.result?.userConversationSettings && response.result.userConversationSettings.length > 0) {
        // 批量插入用户会话关系数据
        const userConversations = response.result.userConversationSettings.map(uc => ({
          userId: uc.userId,
          conversationId: uc.conversationId,
          isHidden: uc.isHidden ? 1 : 0,
          isPinned: uc.isPinned ? 1 : 0,
          isMuted: uc.isMuted ? 1 : 0,
          userReadSeq: uc.userReadSeq,
          version: uc.version,
          createdAt: uc.createAt,
          updatedAt: uc.updateAt,
        }))

        await ChatUserConversationService.batchCreate(userConversations)

        console.log(`用户会话同步成功: userId=${userId}, versionRange=[${minVersion}, ${maxVersion}], count=${userConversations.length}`)
      } else {
        console.log(`用户会话已同步: userId=${userId}, versionRange=[${minVersion}, ${maxVersion}]`)
      }

    } catch (error) {
      console.error('通过版本区间同步用户会话失败:', error)
    }
  }

  /**
   * 处理用户会话表的更新通知
   * 将同步请求加入队列，1秒后批量处理
   */
  async handleTableUpdates(updates: any[]) {
    for (const update of updates) {
      if (update.userId && update.data[0]?.version) {
        this.addToQueue({
          key: update.userId,
          data: { userId: update.userId, version: update.data[0].version },
          timestamp: Date.now(),
          userId: update.userId,
          minVersion: update.data[0].version,
          maxVersion: update.data[0].version,
        })
      }
    }
  }

  /**
   * 批量处理用户会话同步请求
   */
  protected async processBatchRequests(items: UserConversationSyncItem[]): Promise<void> {
    // 按 userId 聚合版本范围
    const userMap = new Map<string, { minVersion: number, maxVersion: number }>()

    for (const item of items) {
      const existing = userMap.get(item.userId)
      if (existing) {
        existing.minVersion = Math.min(existing.minVersion, item.minVersion)
        existing.maxVersion = Math.max(existing.maxVersion, item.maxVersion)
      } else {
        userMap.set(item.userId, {
          minVersion: item.minVersion,
          maxVersion: item.maxVersion,
        })
      }
    }

    // 批量同步用户会话数据
    for (const [userId, versionRange] of userMap) {
      await this.syncUserConversationsByVersionRange(userId, versionRange.minVersion, versionRange.maxVersion)
    }

    // 发送表更新通知
    const userIds = Array.from(userMap.keys())
    this.notifyUserConversationTableUpdate(userIds)
  }

  /**
   * 发送用户会话设置表更新通知
   */
  private notifyUserConversationTableUpdate(userIds: string[]) {
   
  }


}

// 导出单例实例
export const userConversationBusiness = new UserConversationBusiness()
