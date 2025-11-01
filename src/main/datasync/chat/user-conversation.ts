import type { IDatasyncBase } from 'commonModule/type/database'
import { EDataType } from 'commonModule/type/ajax/datasync'
import { SyncStatus } from 'commonModule/type/datasync'
import { userConversationSyncApi } from 'mainModule/api/chat'
import { getSyncCursorApi, updateSyncCursorApi } from 'mainModule/api/datasync'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 会话设置表同步模块
class ConversationSettingSyncModule implements IDatasyncBase {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取服务器和本地版本号
      const serverCursor = await getSyncCursorApi({ dataType: EDataType.CHAT_CONVERSATION_SETTINGS })
      const localCursor = await DataSyncService.get(userId, process.custom.DEVICE_ID, EDataType.CHAT_CONVERSATION_SETTINGS)

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
      logger.error({ text: '会话设置同步失败', data: { error: (error as any)?.message } }, 'ConversationSettingSyncModule')
    }
  }

  // 同步用户会话关系数据
  async sync(fromVersion: number, toVersion: number) {
    this.syncStatus = SyncStatus.SYNCING

    logger.info({ text: '开始同步会话设置数据', data: { fromVersion, toVersion } }, 'ConversationSettingSyncModule')

    let currentVersion = fromVersion
    while (currentVersion <= toVersion) {
      const response = await userConversationSyncApi({
        fromVersion: currentVersion,
        toVersion,
        limit: 100,
      })

      if (response.result.userConversations.length > 0) {
        const userConversations = response.result.userConversations.map(uc => ({
          userId: uc.userId,
          conversationId: uc.conversationId,
          joinedAt: uc.joinedAt,
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

        // 更新到服务器返回的nextVersion
        currentVersion = response.result.nextVersion
      }
      else {
        break
      }
    }

    logger.info({ text: '会话设置数据同步完成', data: { fromVersion, toVersion } }, 'ConversationSettingSyncModule')
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      userId,
      deviceId: process.custom.DEVICE_ID,
      dataType: EDataType.CHAT_CONVERSATION_SETTINGS,
      lastSeq: lastVersion,
      syncStatus: SyncStatus.COMPLETED,
    })

    await updateSyncCursorApi({
      dataType: EDataType.CHAT_CONVERSATION_SETTINGS,
      lastSeq: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出会话设置同步模块实例
export default new ConversationSettingSyncModule()
