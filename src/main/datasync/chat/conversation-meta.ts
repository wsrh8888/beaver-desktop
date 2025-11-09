import { SyncStatus } from 'commonModule/type/datasync'
import { conversationSyncApi, getConversationsListByIdsApi } from 'mainModule/api/chat'
import { datasyncGetSyncChatConversationsApi } from 'mainModule/api/datasync'
import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import { ChatSyncStatusService } from 'mainModule/database/services/chat/sync-status'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'
import messageSyncModule from './chat-message'

// 数据同步表同步模块
class DatasyncSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId) {
      logger.error({ text: '用户ID不能为空' }, 'DatasyncSyncModule')
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

      // 处理变更的会话
      if (response.result.conversationVersions.length > 0) {
        await this.syncConversations(response.result.conversationVersions)
        await this.updateCursor(userId, serverTimestamp)
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '数据同步失败', data: { error: (error as any)?.message } }, 'DatasyncSyncModule')
    }
  }

  // 同步会话数据
  async syncConversations(conversationVersions: any[]) {
    this.syncStatus = SyncStatus.SYNCING

    logger.info({ text: '开始同步会话元信息数据', data: { count: conversationVersions.length } }, 'DatasyncSyncModule')

    // 提取所有变更的会话ID
    const conversationIds = conversationVersions.map(item => item.conversationId)

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

        // 更新同步状态
        for (const conv of response.result.conversations) {
          // 找到对应的版本号
          const versionItem = conversationVersions.find(v => v.conversationId === conv.conversationId)
          if (versionItem) {
            await ChatSyncStatusService.upsertConversationSyncStatus(conv.conversationId, versionItem.version)
          }
        }
      }
    }

    logger.info({ text: '会话元信息数据同步完成', data: { totalCount: conversationIds.length } }, 'DatasyncSyncModule')
  }

  // 同步单个会话元信息
  private async syncConversation(conversationId: string, version: number) {
    try {
      // 调用会话同步API获取会话详情
      const response = await conversationSyncApi({
        conversationId,
        version,
      })

      if (response.result.conversation) {
        // 更新本地会话数据
        await ChatConversationService.upsert(response.result.conversation)

        // 更新同步状态
        await ChatSyncStatusService.upsertConversationSyncStatus(conversationId, version)

        logger.info({ text: '会话元信息同步成功', data: { conversationId, version } }, 'DatasyncSyncModule')
      }
    }
    catch (error) {
      logger.error({ text: '会话元信息同步失败', data: { conversationId, version, error: (error as any)?.message } }, 'DatasyncSyncModule')
      throw error
    }
  }

  // 同步单个会话及其消息
  private async syncConversationWithMessages(conv: any) {
    // 获取本地消息同步状态，检查是否需要同步消息
    const localSyncStatus = await ChatSyncStatusService.getMessageSyncStatus(conv.conversationId)
    const localMaxSeq = localSyncStatus?.messageSeq || 0

    // 先插入/更新会话元数据
    const conversationData = {
      conversationId: conv.conversationId,
      type: conv.type,
      seq: conv.seq,
      lastMessage: conv.lastMessage,
      version: conv.version,
      createdAt: conv.createAt,
      updatedAt: conv.updateAt,
    }

    logger.info({
      text: '会话元数据',
      data: {
        conversationId: conv.conversationId,
        type: conv.type,
        seq: conv.seq,
        lastMessage: conv.lastMessage,
        localMaxSeq,
      },
    }, 'DatasyncSyncModule')

    // 如果服务器seq大于本地maxSeq，需要同步消息
    if (conv.seq > localMaxSeq) {
      logger.info({
        text: '会话需要同步消息',
        data: {
          conversationId: conv.conversationId,
          localMaxSeq,
          serverSeq: conv.seq,
        },
      }, 'DatasyncSyncModule')

      // 同步该会话的消息（通过消息同步模块）
      await messageSyncModule.syncConversationMessages(
        conv.conversationId,
        localMaxSeq, // 从本地最大seq+1开始
        conv.seq, // 到服务器最大seq
      )

      // 更新消息同步状态
      await ChatSyncStatusService.upsertMessageSyncStatus(conv.conversationId, conv.seq)
    }
    else {
      return
    }

    // 更新会话同步状态
    await ChatSyncStatusService.upsertConversationSyncStatus(conv.conversationId, conv.version)

    await ChatConversationService.batchCreate([conversationData])
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      module: 'chat_conversations',
      version: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出数据同步表同步模块实例
export default new DatasyncSyncModule()
