import type { IDatasyncBase } from 'commonModule/type/database'
import { EDataType } from 'commonModule/type/ajax/datasync'
import { SyncStatus } from 'commonModule/type/datasync'
import { friendVerifySyncApi } from 'mainModule/api/frined'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'
import { getSyncCursorApi, updateSyncCursorApi } from '../../api/datasync'
import { DataSyncService } from '../../database/services/datasync/datasync'
import { FriendVerifyService } from '../../database/services/friend/friend_verify'

// 好友验证数据同步模块
class FriendVerifySyncModule implements IDatasyncBase {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId) {
      return
    }

    try {
      // 获取服务器和本地版本号
      const serverCursor = await getSyncCursorApi({ dataType: EDataType.FRIEND_VERIFY })
      const localCursor = await DataSyncService.get(userId, process.custom.DEVICE_ID, EDataType.FRIEND_VERIFY)

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
      logger.error({ text: '好友验证同步失败', data: { error: (error as any)?.message } }, 'FriendVerifySyncModule')
    }
  }

  // 同步好友验证数据
  async sync(fromVersion: number, toVersion: number) {
    logger.info({ text: '开始同步好友验证数据', data: { fromVersion, toVersion } }, 'FriendVerifySyncModule')

    let currentVersion = fromVersion
    while (currentVersion <= toVersion) {
      const response = await friendVerifySyncApi({
        fromVersion: currentVersion,
        toVersion,
        limit: 100,
      })

      if (response.result.friendVerifies.length > 0) {
        const friendVerifies = response.result.friendVerifies.map((verify: any) => ({
          uuid: verify.uuid,
          sendUserId: verify.sendUserId,
          revUserId: verify.revUserId,
          sendStatus: verify.sendStatus,
          revStatus: verify.revStatus,
          message: verify.message,
          source: verify.source,
          version: verify.version,
          createdAt: verify.createAt,
          updatedAt: verify.updateAt,
        }))

        // 批量插入好友验证数据
        await FriendVerifyService.batchCreate(friendVerifies)

        // 更新到服务器返回的nextVersion
        currentVersion = response.result.nextVersion
      }
      else {
        break
      }
    }

    logger.info({ text: '好友验证数据同步完成', data: { fromVersion, toVersion } }, 'FriendVerifySyncModule')
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      userId,
      deviceId: process.custom.DEVICE_ID,
      dataType: EDataType.FRIEND_VERIFY,
      lastSeq: lastVersion,
      syncStatus: SyncStatus.COMPLETED,
    })

    await updateSyncCursorApi({
      dataType: EDataType.FRIEND_VERIFY,
      lastSeq: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出好友验证同步模块实例
export default new FriendVerifySyncModule()
