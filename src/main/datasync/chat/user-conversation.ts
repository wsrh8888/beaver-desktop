import { getUserConversationSettingsListByIdsApi } from 'mainModule/api/chat'
import { datasyncGetSyncChatUserConversationsApi } from 'mainModule/api/datasync'
import  dBServiceChatSyncStatus from 'mainModule/database/services/chat/sync-status'
import dbServiceChatUserConversation  from 'mainModule/database/services/chat/user-conversation'
import dbServiceDataSync  from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-user-conversation')

// 用户会话设置同步器
class UserConversationSync {
  // 检查并同步用户会话设置
  async checkAndSync() {
    logger.info({ text: '开始同步用户会话设置' })
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return
    try {
      // 获取本地同步时间戳
      const localCursor = await dbServiceDataSync.get({ module: 'chat_user_conversations' })
      const lastSyncTime = localCursor?.updatedAt || 0
      // 获取服务器上变更的用户会话设置版本信息
      const serverResponse = await datasyncGetSyncChatUserConversationsApi({
        since: lastSyncTime,
      })

      // 对比本地数据，过滤出需要更新的会话
      const needUpdateConversations = await this.compareAndFilterUserConversationVersions(serverResponse.result.userConversationVersions)

      if (needUpdateConversations.length > 0) {
        // 有变更的用户会话设置，需要同步数据
        await this.syncUserConversationSettings(needUpdateConversations)
      }

      // 更新游标（无论是否有变更都要更新）
      await dbServiceDataSync.upsert({
        module: 'chat_user_conversations',
        version: -1, // 使用时间戳而不是版本号
        updatedAt: serverResponse.result.serverTimestamp,
      }).catch(() => {})
    }
    catch (error) {
      logger.error({ text: '用户会话设置同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的会话信息
  private async compareAndFilterUserConversationVersions(userConversationVersions: any[]): Promise<Array<{ conversationId: string, version: number }>> {
    try {
    if (userConversationVersions.length === 0) {
      return []
    }

    // 提取所有变更的会话ID
    const conversationIds = userConversationVersions.map(item => item.conversationId)

    // 查询本地已存在的用户会话版本状态
    const localVersions = await dBServiceChatSyncStatus.getUserConversationVersions({ conversationIds })
    const localVersionMap = new Map(localVersions.map(v => [v.conversationId, v.version]))

    // 过滤出需要更新的会话信息（本地不存在或版本号更旧的数据）
    const needUpdateConversations = userConversationVersions.filter((conversation) => {
      const localVersion = localVersionMap.get(conversation.conversationId) || 0

      // 如果服务器版本更新，则需要更新
      return localVersion < conversation.version
    })

    return needUpdateConversations
    }
    catch (error) {
      logger.error({ text: '用户会话设置版本对比失败', data: { error: (error as any)?.message } })
      return []
    }
  }

  // 同步用户会话设置数据
  private async syncUserConversationSettings(conversationsWithVersions: Array<{ conversationId: string, version: number }>) {
    try {
    // 提取会话ID列表
      const conversationIds = conversationsWithVersions.map(item => item.conversationId)

      // 版本信息将在后续处理中使用

      // 分批获取用户会话设置数据（避免一次性获取过多数据）
      const batchSize = 50
      for (let i = 0; i < conversationIds.length; i += batchSize) {
        const batchIds = conversationIds.slice(i, i + batchSize)

        const response = await getUserConversationSettingsListByIdsApi({
          conversationIds: batchIds,
        })

        if (response.result.userConversationSettings && response.result.userConversationSettings.length > 0) {
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

          // 批量插入用户会话关系数据
          await dbServiceChatUserConversation.batchCreate({ userConversations })

          // 更新同步状态（使用响应中的版本号）
          for (const uc of response.result.userConversationSettings) {
            if (uc.version !== undefined) {
              await dBServiceChatSyncStatus.upsertUserConversationSyncStatus({ conversationId: uc.conversationId, version: uc.version })
            }
          }
        }
      }
    } catch (error) {
      logger.error({ text: '用户会话设置同步失败', data: { error: (error as any)?.message } })
    }
  }
}

// 导出用户会话设置同步器实例
export default new UserConversationSync()
