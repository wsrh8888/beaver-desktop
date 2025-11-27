import { getConversationsListByIdsApi } from 'mainModule/api/chat'
import { datasyncGetSyncChatConversationsApi } from 'mainModule/api/datasync'
import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import { ChatSyncStatusService } from 'mainModule/database/services/chat/sync-status'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-conversation-meta')

// 会话元数据同步器
class ConversationMetaSync {
  // 检查并同步会话元数据
  async checkAndSync() {
    logger.info({ text: '开始同步会话元数据' })
    const userId = store.get('userInfo')?.userId
    if (!userId) {
      return
    }

    try {
      // 获取本地最后同步时间
      const localCursor = await DataSyncService.get('chat_conversations')
      const lastSyncTime = localCursor?.version || 0

      // 获取服务器变更的会话版本信息
      const response = await datasyncGetSyncChatConversationsApi({
        since: lastSyncTime,
      })

      const serverTimestamp = response.result.serverTimestamp

      // 对比本地数据，过滤出需要更新的会话
      const needUpdateConversations = await this.compareAndFilterConversationVersions(response.result.conversationVersions)

      // 处理变更的会话
      if (needUpdateConversations.length > 0) {
        await this.syncConversations(needUpdateConversations)
      }

      // 更新游标（无论是否有变更都要更新）
      await DataSyncService.upsert({
        module: 'chat_conversations',
        version: -1, // 使用时间戳而不是版本号
        updatedAt: serverTimestamp,
      }).catch(() => {})

      logger.info({ text: '会话元数据同步完成' })
    }
    catch (error) {
      logger.error({ text: '会话元数据同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的会话信息
  private async compareAndFilterConversationVersions(conversationVersions: any[]): Promise<Array<{ conversationId: string, version: number }>> {
    if (conversationVersions.length === 0) {
      return []
    }

    // 提取所有变更的会话ID
    const conversationIds = conversationVersions.map(item => item.conversationId)

    // 查询本地已存在的会话版本状态
    const localVersions = await ChatSyncStatusService.getConversationVersions(conversationIds)
    const localVersionMap = new Map(localVersions.map(v => [v.conversationId, v.version]))

    // 过滤出需要更新的会话信息（本地不存在或版本号更旧的数据）
    const needUpdateConversations = conversationVersions.filter((conversation) => {
      const localVersion = localVersionMap.get(conversation.conversationId) || 0

      // 如果服务器版本更新，则需要更新
      return localVersion < conversation.version
    })

    logger.info({
      text: '会话元数据版本对比结果',
      data: {
        total: conversationIds.length,
        needUpdate: needUpdateConversations.length,
        skipped: conversationIds.length - needUpdateConversations.length,
      },
    })

    return needUpdateConversations
  }

  // 同步会话数据
  private async syncConversations(conversationsWithVersions: Array<{ conversationId: string, version: number }>) {
    logger.info({ text: '开始同步会话元信息数据', data: { count: conversationsWithVersions.length } })

    // 提取会话ID列表
    const conversationIds = conversationsWithVersions.map(item => item.conversationId)

    // 构建版本映射，方便查找
    const _versionMap = new Map(conversationsWithVersions.map(item => [item.conversationId, item.version]))

    // 分批获取会话数据（避免一次性获取过多数据）
    const batchSize = 50
    for (let i = 0; i < conversationIds.length; i += batchSize) {
      const batchIds = conversationIds.slice(i, i + batchSize)

      const response = await getConversationsListByIdsApi({
        conversationIds: batchIds,
      })

      if (response.result.conversations.length > 0) {
        // 批量更新本地会话数据
        for (const conv of response.result.conversations) {
          await ChatConversationService.upsert(conv)
        }

        // 更新同步状态（使用响应中的版本号）
        for (const conv of response.result.conversations) {
          if (conv.version !== undefined) {
            await ChatSyncStatusService.upsertConversationSyncStatus(conv.conversationId, conv.version)
          }
        }
      }
    }

    logger.info({ text: '会话元信息数据同步完成', data: { totalCount: conversationsWithVersions.length } })
  }
}

// 导出会话元数据同步器实例
export default new ConversationMetaSync()
