import { SyncStatus } from 'commonModule/type/datasync'
import { getUserConversationSettingsListByIdsApi } from 'mainModule/api/chat'
import { datasyncGetSyncChatUserConversationsApi } from 'mainModule/api/datasync'
import { ChatSyncStatusService } from 'mainModule/database/services/chat/sync-status'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 会话设置表同步模块
class ConversationSettingSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取本地同步时间戳
      const localCursor = await DataSyncService.get('chat_user_conversations')
      const lastSyncTime = localCursor?.version || 0

      // 获取服务器上变更的用户会话设置版本信息
      const serverResponse = await datasyncGetSyncChatUserConversationsApi({
        since: lastSyncTime,
      })

      if (serverResponse.result.userConversationVersions.length > 0) {
        // 有变更的用户会话设置，需要同步数据
        await this.syncUserConversationSettings(serverResponse.result.userConversationVersions)
        await this.updateCursor(userId, serverResponse.result.serverTimestamp)
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '会话设置同步失败', data: { error: (error as any)?.message } }, 'ConversationSettingSyncModule')
    }
  }

  // 同步用户会话设置数据
  async syncUserConversationSettings(userConversationVersions: any[]) {
    this.syncStatus = SyncStatus.SYNCING

    logger.info({ text: '开始同步会话设置数据', data: { count: userConversationVersions.length } }, 'ConversationSettingSyncModule')

    // 提取所有变更的会话ID
    const conversationIds = userConversationVersions.map(item => item.conversationId)

    // 分批获取用户会话设置数据（避免一次性获取过多数据）
    const batchSize = 50
    for (let i = 0; i < conversationIds.length; i += batchSize) {
      const batchIds = conversationIds.slice(i, i + batchSize)

      const response = await getUserConversationSettingsListByIdsApi({
        conversationIds: batchIds,
      })

      if (response.result.userConversationSettings.length > 0) {
        const userConversations = response.result.userConversationSettings.map(uc => ({
          userId: uc.userId,
          conversationId: uc.conversationId,
          lastMessage: uc.lastMessage,
          isHidden: uc.isHidden ? 1 : 0,
          isPinned: uc.isPinned ? 1 : 0,
          isMuted: uc.isMuted ? 1 : 0,
          userReadSeq: uc.userReadSeq,
          version: uc.version,
          createdAt: uc.createAt,
          updatedAt: uc.updateAt,
        }))

        // 批量插入用户会话关系数据
        await ChatUserConversationService.batchCreate(userConversations)

        // 更新同步状态
        for (const uc of response.result.userConversationSettings) {
          // 找到对应的版本号
          const versionItem = userConversationVersions.find(v => v.conversationId === uc.conversationId)
          if (versionItem) {
            await ChatSyncStatusService.upsertUserConversationSyncStatus(uc.conversationId, versionItem.version)
          }
        }
      }
    }

    logger.info({ text: '会话设置数据同步完成', data: { totalCount: conversationIds.length } }, 'ConversationSettingSyncModule')
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      module: 'chat_user_conversations',
      version: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出会话设置同步模块实例
export default new ConversationSettingSyncModule()
