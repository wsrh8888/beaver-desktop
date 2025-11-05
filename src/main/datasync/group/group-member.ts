import { EDataType } from 'commonModule/type/ajax/datasync'
import { SyncStatus } from 'commonModule/type/datasync'
import { getSyncCursorApi, updateSyncCursorApi } from 'mainModule/api/datasync'
import { groupMemberSyncApi } from 'mainModule/api/group'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { GroupMemberService } from 'mainModule/database/services/group/group-member'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 群成员同步模块
class GroupMemberSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取服务器和本地版本号
      const serverCursor = await getSyncCursorApi({ dataType: EDataType.GROUP_MEMBERS })
      const localCursor = await DataSyncService.get(userId, process.custom.DEVICE_ID, EDataType.GROUP_MEMBERS)

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
      logger.error({ text: '群成员同步失败', data: { error: (error as any)?.message } }, 'GroupMemberSyncModule')
    }
  }

  // 同步群成员数据
  async sync(fromVersion: number, toVersion: number) {
    this.syncStatus = SyncStatus.SYNCING

    logger.info({ text: '开始同步群成员数据', data: { fromVersion, toVersion } }, 'GroupMemberSyncModule')

    let currentVersion = fromVersion
    while (currentVersion <= toVersion) {
      const response = await groupMemberSyncApi({
        fromVersion: currentVersion,
        toVersion,
        limit: 100,
      })

      if (response.result.groupMembers.length > 0) {
        const groupMembers = response.result.groupMembers.map((member: any) => ({
          id: member.id,
          groupId: member.groupId,
          userId: member.userId,
          role: member.role,
          status: member.status,
          createdAt: member.createAt,
          updatedAt: member.updateAt,
        }))

        // 批量插入群成员数据
        await GroupMemberService.batchCreate(groupMembers)

        // 更新到服务器返回的nextVersion
        currentVersion = response.result.nextVersion
      }
      else {
        break
      }
    }

    logger.info({ text: '群成员数据同步完成', data: { fromVersion, toVersion } }, 'GroupMemberSyncModule')
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      userId,
      deviceId: process.custom.DEVICE_ID,
      dataType: EDataType.GROUP_MEMBERS,
      lastSeq: lastVersion,
      syncStatus: SyncStatus.COMPLETED,
    })

    await updateSyncCursorApi({
      dataType: EDataType.GROUP_MEMBERS,
      lastSeq: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导群成员同步模块实例
export default new GroupMemberSyncModule()
