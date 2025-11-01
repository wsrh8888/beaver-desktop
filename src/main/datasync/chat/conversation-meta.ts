import type { IDatasyncBase } from 'commonModule/type/database'
import { EDataType } from 'commonModule/type/ajax/datasync'
import { SyncStatus } from 'commonModule/type/datasync'
import { conversationSyncApi } from 'mainModule/api/chat'
import { getSyncCursorApi, updateSyncCursorApi } from 'mainModule/api/datasync'
import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 数据同步表同步模块
class DatasyncSyncModule implements IDatasyncBase {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId) {
      logger.error({ text: '用户ID不能为空' }, 'DatasyncSyncModule')
      return
    }

    try {
      // 获取服务器和本地版本号
      const serverCursor = await getSyncCursorApi({ dataType: EDataType.CHAT_DATASYNC })
      const localCursor = await DataSyncService.get(userId, process.custom.DEVICE_ID, EDataType.CHAT_DATASYNC)

      const localVersion = localCursor?.lastSeq || 0
      const serverVersion = serverCursor.result.lastSeq

      // 需要同步就同步
      if (serverVersion > localVersion) {
        await this.sync(localVersion, serverVersion)
        await this.updateCursor(userId, serverVersion)
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '数据同步失败', data: { error: (error as any)?.message } }, 'DatasyncSyncModule')
    }
  }

  // 同步会话数据
  async sync(fromVersion: number, toVersion: number) {
    this.syncStatus = SyncStatus.SYNCING

    logger.info({ text: '开始同步数据同步表数据', data: { fromVersion, toVersion } }, 'DatasyncSyncModule')

    let currentVersion = fromVersion
    while (currentVersion <= toVersion) {
      const response = await conversationSyncApi({
        fromVersion: currentVersion,
        toVersion,
        limit: 100,
      })

      if (response.result.conversations.length > 0) {
        const conversations = response.result.conversations.map(conv => ({
          conversationId: conv.conversationId,
          type: conv.type,
          maxSeq: conv.maxSeq,
          lastMessage: conv.lastMessage,
          version: conv.version,
          createdAt: conv.createAt,
          updatedAt: conv.updateAt,
        }))

        // 批量插入会话数据
        await ChatConversationService.batchCreate(conversations)

        // 更新到服务器返回的nextVersion
        currentVersion = response.result.nextVersion
      }
      else {
        break
      }
    }

    logger.info({ text: '数据同步表数据同步完成', data: { fromVersion, toVersion } }, 'DatasyncSyncModule')
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      userId,
      deviceId: process.custom.DEVICE_ID,
      dataType: EDataType.CHAT_DATASYNC,
      lastSeq: lastVersion,
      syncStatus: SyncStatus.COMPLETED,
    })

    await updateSyncCursorApi({
      dataType: EDataType.CHAT_DATASYNC,
      lastSeq: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出数据同步表同步模块实例
export default new DatasyncSyncModule()
