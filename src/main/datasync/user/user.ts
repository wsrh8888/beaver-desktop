import { SyncStatus } from 'commonModule/type/datasync'
import { datasyncGetSyncAllUsersApi } from 'mainModule/api/datasync'
import { userSyncApi } from 'mainModule/api/user'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { UserSyncStatusService } from 'mainModule/database/services/user/sync-status'
import { UserService } from 'mainModule/database/services/user/user'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 用户数据同步模块（两阶段增量同步）
export class UserSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 登录时同步用户数据
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId) {
      logger.warn({ text: '用户同步跳过：用户ID为空' }, 'UserSyncModule')
      return
    }

    try {
      await this.syncAllUsersInBackground()
      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '用户同步失败', data: { error: (error as any)?.message } }, 'UserSyncModule')
    }
  }

  // 两阶段用户数据同步（包含本地差值比较）
  private async syncAllUsersInBackground() {
    try {
      // 1. 获取本地最后同步时间
      const cursor = await DataSyncService.get('users').catch(() => null)
      const lastSyncTime = cursor?.version || 0

      // 2. 获取变更的用户版本摘要
      const response = await datasyncGetSyncAllUsersApi({
        type: 'all',
        since: lastSyncTime,
      }).catch(() => ({ result: { userVersions: [], serverTimestamp: Date.now() } }))

      const changedUserVersions = response.result.userVersions
      const serverTimestamp = response.result.serverTimestamp

      if (changedUserVersions.length === 0) {
        // 即使没有变更，也要更新同步时间
        await DataSyncService.upsert({
          module: 'users',
          version: serverTimestamp,
        }).catch(() => {})
        return
      }

      // 3. 和本地版本比较，找出需要同步的用户
      const serverVersions = changedUserVersions.reduce((acc: Record<string, number>, item: any) => {
        acc[item.userId] = item.version
        return acc
      }, {})

      const usersNeedSync = await UserSyncStatusService.getUsersNeedSync(serverVersions)
      console.error('2222222222222222222222222222')
      console.error('2222222222222222222222222222')
      console.error('2222222222222222222222222222')
      console.error('2222222222222222222222222222')
      console.error('2222222222222222222222222222')
      console.error('2222222222222222222222222222')
      console.error('2222222222222222222222222222')
      console.error('2222222222222222222222222222')

      console.error(usersNeedSync)
      if (usersNeedSync.length === 0) {
        // 更新同步时间，即使没有需要同步的用户
        await DataSyncService.upsert({
          module: 'users',
          version: serverTimestamp,
        }).catch(() => {})
        return
      }

      // 4. 只同步需要更新的用户
      const userVersionList = changedUserVersions
        .filter((item: any) => usersNeedSync.includes(item.userId))
        .map((item: any) => ({
          userId: item.userId,
          version: item.version,
        }))

      const syncResponse = await userSyncApi({ userVersions: userVersionList })
      if (syncResponse.result.users?.length > 0) {
        const usersModels = syncResponse.result.users.map((user: any) => ({
          uuid: user.userId,
          nickName: user.nickname,
          avatar: user.avatar,
          abstract: user.abstract,
          phone: user.phone,
          email: user.email,
          gender: user.gender,
          status: user.status,
          version: user.version,
          createdAt: user.createAt,
          updatedAt: user.updateAt,
        }))

        await UserService.batchCreate(usersModels)

        // 更新本地用户版本状态
        const statusUpdates = usersModels.map(user => ({
          userId: user.uuid,
          userVersion: user.version,
        }))
        await UserSyncStatusService.batchUpsertUserSyncStatus(statusUpdates)
      }

      // 5. 更新同步时间（使用服务端时间戳）
      await DataSyncService.upsert({
        dataType: 'users',
        lastSeq: serverTimestamp,
        syncStatus: 'completed',
      }).catch(() => {})
    }
    catch (error: any) {
      logger.error({ text: '用户数据同步失败', data: { error: error.message } }, 'UserSyncModule')
    }
  }
}
// 导出用户同步模块实例
export const userSyncModule = new UserSyncModule()
