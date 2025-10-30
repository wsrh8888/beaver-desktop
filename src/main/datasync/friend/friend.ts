import type { IDatasyncBase } from 'commonModule/type/database'
import { EDataType } from 'commonModule/type/ajax/datasync'
import { SyncStatus } from 'commonModule/type/datasync'
import { getSyncCursorApi, updateSyncCursorApi } from 'mainModule/api/datasync'
import { friendSyncApi } from 'mainModule/api/frined'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { FriendService } from 'mainModule/database/services/friend/friend'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 好友数据同步模块
export class FriendSyncModule implements IDatasyncBase {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取服务器和本地版本号
      const serverCursor = await getSyncCursorApi({ dataType: EDataType.FRIENDS })
      const localCursor = await DataSyncService.get(userId, process.custom.DEVICE_ID, EDataType.FRIENDS)

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
      logger.error({ text: '好友同步失败', data: { error: (error as any)?.message } }, 'FriendSyncModule')
    }
  }

  // 同步好友数据
  async sync(fromVersion: number, toVersion: number) {
    logger.info({ text: '开始同步好友数据', data: { fromVersion, toVersion } }, 'FriendSyncModule')

    let currentVersion = fromVersion
    while (currentVersion <= toVersion) {
      const response = await friendSyncApi({
        fromVersion: currentVersion,
        toVersion,
        limit: 100,
      })

      if (response.result.friends.length > 0) {
        const friends = response.result.friends.map((friend: any) => ({
          uuid: friend.uuid,
          sendUserId: friend.sendUserId,
          revUserId: friend.revUserId,
          sendUserNotice: friend.sendUserNotice,
          revUserNotice: friend.revUserNotice,
          source: friend.source,
          isDeleted: friend.isDeleted ? 1 : 0,
          version: friend.version,
          createdAt: friend.createAt,
          updatedAt: friend.updateAt,
        }))

        // 批量插入好友数据
        await FriendService.batchCreate(friends)

        // 更新到服务器返回的nextVersion
        currentVersion = response.result.nextVersion
      }
      else {
        break
      }
    }

    logger.info({ text: '好友数据同步完成', data: { fromVersion, toVersion } }, 'FriendSyncModule')
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      userId,
      deviceId: process.custom.DEVICE_ID,
      dataType: EDataType.FRIENDS,
      lastSeq: lastVersion,
      syncStatus: SyncStatus.COMPLETED,
    })

    await updateSyncCursorApi({
      dataType: EDataType.FRIENDS,
      lastSeq: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出好友同步模块实例
export const friendSyncModule = new FriendSyncModule()
