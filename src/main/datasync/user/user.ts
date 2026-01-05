import { SyncStatus } from 'commonModule/type/datasync'
import { NotificationModule, NotificationUserCommand } from 'commonModule/type/preload/notification'
import { datasyncGetSyncAllUsersApi } from 'mainModule/api/datasync'
import { userSyncApi } from 'mainModule/api/user'
import dbServiceDataSync  from 'mainModule/database/services/datasync/datasync'
import dBServiceUserSyncStatus from 'mainModule/database/services/user/sync-status'
import dBServiceUser  from 'mainModule/database/services/user/user'

import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 用户数据同步模块（两阶段增量同步）
class UserSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 登录时同步用户数据
  async checkAndSync() {
    logger.info({ text: '开始同步用户数据' })
    const userId = store.get('userInfo')?.userId
    if (!userId) {
      return
    }

    try {
      // 获取本地最后同步时间
      const cursor = await dbServiceDataSync.get({ module: 'users' }).catch(() => null)
      const lastSyncTime = cursor?.version || 0

      // 获取变更的用户版本摘要
      const response = await datasyncGetSyncAllUsersApi({
        type: 'all',
        since: lastSyncTime,
      }).catch(() => ({ result: { userVersions: [], serverTimestamp: Date.now() } }))

      const changedUserVersions = response.result.userVersions
      const serverTimestamp = response.result.serverTimestamp

      // 对比本地数据，过滤出需要更新的用户
      const needUpdateUsers = await this.compareAndFilterUserVersions(changedUserVersions)

      if (needUpdateUsers.length > 0) {
        // 有需要更新的用户数据
        await this.syncUserData(needUpdateUsers)
        // 从变更的数据中找到最大的版本号
        const maxVersion = Math.max(...changedUserVersions.map(item => item.version))
        await dbServiceDataSync.upsert({
          module: 'users',
          version: maxVersion,
          updatedAt: serverTimestamp,
        }).catch(() => {})
      }
      else {
        // 没有需要更新的数据，直接更新时间戳
        await dbServiceDataSync.upsert({
          module: 'users',
          version: null,
          updatedAt: serverTimestamp,
        }).catch(() => {})
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '用户同步失败', data: { error: (error as any)?.message } }, 'UserSyncModule')
    }
  }

  // 对比本地数据，过滤出需要更新的用户
  private async compareAndFilterUserVersions(userVersions: any[]): Promise<Array<{ userId: string, version: number }>> {
    try {
    if (userVersions.length === 0) {
      return []
    }

    // 获取所有本地用户同步状态
    const localStatuses = await dBServiceUserSyncStatus.getAllUsersSyncStatus()
    const localVersionMap = new Map(localStatuses.map(s => [s.userId, s.userVersion || 0]))

    // 过滤出需要更新的用户，并使用本地版本号（而不是服务器版本号）
    const needUpdateUsers: Array<{ userId: string, version: number }> = []
    for (const userVersion of userVersions) {
      const localVersion = localVersionMap.get(userVersion.userId) || 0
      // 如果服务器版本更新，则需要更新
      if (localVersion < userVersion.version) {
        // 使用本地版本号，这样服务器才能返回 version > localVersion 的变更
        needUpdateUsers.push({
          userId: userVersion.userId,
          version: localVersion, // 使用本地版本号，而不是服务器版本号
        })
      }
    }

    return needUpdateUsers
    }
    catch (error) {
      logger.error({ text: '用户版本对比失败', data: { error: (error as any)?.message } })
      return []
    }
  }

  // 同步用户数据
  private async syncUserData(usersWithVersions: Array<{ userId: string, version: number }>) {
    try {
    if (usersWithVersions.length === 0) {
      return
    }

    // 直接使用传入的用户版本信息构造请求
    const syncResponse = await userSyncApi({ userVersions: usersWithVersions })
    if (syncResponse.result.users?.length > 0) {
      const usersModels = syncResponse.result.users.map((user: any) => ({
        userId: user.userId,
        nickName: user.nickName,
        avatar: user.avatar,
        abstract: user.abstract,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        status: user.status,
        version: user.version,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }))

      await dBServiceUser.batchCreate({ usersData: usersModels })

      // 更新本地用户版本状态
      const statusUpdates = usersModels.map(user => ({
        userId: user.userId,
        userVersion: user.version,
      }))
      await dBServiceUserSyncStatus.batchUpsertUserSyncStatus(statusUpdates)

      // 发送通知到render进程，告知用户数据已同步
      sendMainNotification('*', NotificationModule.DATABASE_USER, NotificationUserCommand.USER_UPDATE, {
        source: 'datasync', // 标识来源：批量同步
        updatedUsers: usersModels.map(user => ({
          userId: user.userId,
          version: user.version,
        })),
      })
    }
    }
    catch (error) {
      logger.error({ text: '用户数据同步失败', data: { error: (error as any)?.message } })
    }
  }
}
// 导出用户同步模块实例
export const userSyncModule = new UserSyncModule()
