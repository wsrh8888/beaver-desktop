import { EDataType } from 'commonModule/type/ajax/datasync'
import { SyncStatus } from 'commonModule/type/datasync'
import { getSyncCursorApi, updateSyncCursorApi } from 'mainModule/api/datasync'
import { groupJoinRequestSyncApi } from 'mainModule/api/group'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { GroupJoinRequestService } from 'mainModule/database/services/group/group-join-request'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 入群申请同步模块
class GroupJoinRequestSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取服务器和本地版本号
      const serverCursor = await getSyncCursorApi({ dataType: EDataType.GROUP_JOIN_REQUESTS })
      const localCursor = await DataSyncService.get(userId, process.custom.DEVICE_ID, EDataType.GROUP_JOIN_REQUESTS)

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
      logger.error({ text: '入群申请同步失败', data: { error: (error as any)?.message } }, 'GroupJoinRequestSyncModule')
    }
  }

  // 同步入群申请数据
  async sync(fromVersion: number, toVersion: number) {
    this.syncStatus = SyncStatus.SYNCING

    logger.info({ text: '开始同步入群申请数据', data: { fromVersion, toVersion } }, 'GroupJoinRequestSyncModule')

    let currentVersion = fromVersion
    while (currentVersion <= toVersion) {
      const response = await groupJoinRequestSyncApi({
        fromVersion: currentVersion,
        toVersion,
        limit: 100,
      })

      if (response.result.groupJoinRequests.length > 0) {
        const groupJoinRequests = response.result.groupJoinRequests.map((request: any) => ({
          id: request.id,
          groupId: request.groupId,
          applicantUserId: request.applicantUserId,
          message: request.message,
          status: request.status,
          handledBy: request.handledBy,
          handledAt: request.handledAt,
          version: request.version,
          createdAt: request.createAt,
          updatedAt: request.updateAt,
        }))

        // 批量插入入群申请数据
        await GroupJoinRequestService.batchCreate(groupJoinRequests)

        // 更新到服务器返回的nextVersion
        currentVersion = response.result.nextVersion
      }
      else {
        break
      }
    }

    logger.info({ text: '入群申请数据同步完成', data: { fromVersion, toVersion } }, 'GroupJoinRequestSyncModule')
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      userId,
      deviceId: process.custom.DEVICE_ID,
      dataType: EDataType.GROUP_JOIN_REQUESTS,
      lastSeq: lastVersion,
      syncStatus: SyncStatus.COMPLETED,
    })

    await updateSyncCursorApi({
      dataType: EDataType.GROUP_JOIN_REQUESTS,
      lastSeq: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出入群申请同步模块实例
export default new GroupJoinRequestSyncModule()
