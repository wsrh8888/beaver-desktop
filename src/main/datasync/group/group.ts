import { EDataType } from 'commonModule/type/ajax/datasync'
import { SyncStatus } from 'commonModule/type/datasync'
import { getSyncCursorApi, updateSyncCursorApi } from 'mainModule/api/datasync'
import { groupSyncApi } from 'mainModule/api/group'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { GroupService } from 'mainModule/database/services/group/group'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 群组数据同步模块
export class GroupSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取服务器和本地版本号
      const serverCursor = await getSyncCursorApi({ dataType: EDataType.GROUPS })
      const localCursor = await DataSyncService.get(userId, process.custom.DEVICE_ID, EDataType.GROUPS)

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
      logger.error({ text: '群组同步失败', data: { error: (error as any)?.message } }, 'GroupSyncModule')
    }
  }

  // 同步群组数据
  async sync(fromVersion: number, toVersion: number) {
    logger.info({ text: '开始同步群组数据', data: { fromVersion, toVersion } }, 'GroupSyncModule')

    let currentVersion = fromVersion
    while (currentVersion <= toVersion) {
      const response = await groupSyncApi({
        fromVersion: currentVersion,
        toVersion,
        limit: 100,
      })

      if (response.result.groups.length > 0) {
        const groups = response.result.groups.map((group: any) => ({
          uuid: group.groupId,
          title: group.title,
          fileName: group.fileName,
          creatorId: group.creatorId,
          joinType: group.joinType,
          isDeleted: group.isDeleted ? 1 : 0,
          createdAt: group.createAt,
          updatedAt: group.updateAt,
        }))

        // 批量插入群组数据
        await GroupService.batchCreate(groups)

        // 更新到服务器返回的nextVersion
        currentVersion = response.result.nextVersion
      }
      else {
        break
      }
    }

    logger.info({ text: '群组数据同步完成', data: { fromVersion, toVersion } }, 'GroupSyncModule')
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      userId,
      deviceId: process.custom.DEVICE_ID,
      dataType: EDataType.GROUPS,
      lastSeq: lastVersion,
      syncStatus: SyncStatus.COMPLETED,
    })

    await updateSyncCursorApi({
      dataType: EDataType.GROUPS,
      lastSeq: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出群组同步模块实例
export default new GroupSyncModule()
