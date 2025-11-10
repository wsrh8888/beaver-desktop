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
      // 获取本地最后同步时间
      const cursor = await DataSyncService.get('users').catch(() => null)
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
        await DataSyncService.upsert({
          module: 'users',
          version: maxVersion,
          updatedAt: serverTimestamp,
        }).catch(() => {})
      }
      else {
        // 没有需要更新的数据，直接更新时间戳
        await DataSyncService.upsert({
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
    if (userVersions.length === 0) {
      return []
    }

    // 构建服务器版本映射
    const serverVersions = userVersions.reduce((acc: Record<string, number>, item: any) => {
      acc[item.userId] = item.version
      return acc
    }, {})

    // 获取需要同步的用户ID列表
    const usersNeedSync = await UserSyncStatusService.getUsersNeedSync(serverVersions)

    logger.info({
      text: '用户版本对比结果',
      data: {
        total: userVersions.length,
        needUpdate: usersNeedSync.length,
        skipped: userVersions.length - usersNeedSync.length,
      },
    }, 'UserSyncModule')

    // 返回完整的用户版本对象
    return userVersions.filter(item => usersNeedSync.includes(item.userId))
  }

  // 同步用户数据
  private async syncUserData(usersWithVersions: Array<{ userId: string, version: number }>) {
    logger.info({ text: '开始同步用户数据', data: { count: usersWithVersions.length } }, 'UserSyncModule')

    if (usersWithVersions.length === 0) {
      return
    }

    // 直接使用传入的用户版本信息构造请求
    const syncResponse = await userSyncApi({ userVersions: usersWithVersions })
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

      logger.info({ text: '用户数据同步完成', data: { totalCount: usersModels.length } }, 'UserSyncModule')
    }
  }
}
// 导出用户同步模块实例
export const userSyncModule = new UserSyncModule()
