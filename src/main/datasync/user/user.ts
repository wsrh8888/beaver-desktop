import { SyncStatus } from 'commonModule/type/datasync'
import { friendUserVersionsApi } from 'mainModule/api/frined'
import { userSyncByIdsApi } from 'mainModule/api/user'
import { UserService } from 'mainModule/database/services/user/user'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 用户数据同步模块（大厂简化版：按需同步）
export class UserSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 登录时同步当前用户和好友（大厂真实做法）
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId) {
      logger.warn({ text: '用户同步跳过：用户ID为空' }, 'UserSyncModule')
      return
    }

    try {
      logger.info({ text: '开始登录用户数据同步', data: { userId } }, 'UserSyncModule')

      // 一次性同步所有用户（当前用户 + 好友）
      await this.syncAllUsersInBackground(userId)

      this.syncStatus = SyncStatus.COMPLETED
      logger.info({ text: '登录用户数据同步完成' }, 'UserSyncModule')
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '登录用户同步失败', data: {
        error: (error as any)?.message,
        userId,
      } }, 'UserSyncModule')
    }
  }

  // 一次性同步所有用户（当前用户 + 好友）
  private async syncAllUsersInBackground(userId: string) {
    try {
      logger.info({ text: '开始同步所有用户信息', data: { userId } }, 'UserSyncModule')

      // 1. 获取所有用户ID（好友 + 当前用户）
      const allUserIds = await this.getAllUserIds()

      if (allUserIds.length === 0) {
        logger.info({ text: '没有用户需要同步' }, 'UserSyncModule')
        return
      }

      // 2. 批量同步所有用户的信息
      await this.syncUsersByIds(allUserIds)

      logger.info({ text: '所有用户信息同步完成', data: { userCount: allUserIds.length } }, 'UserSyncModule')
    }
    catch (error: any) {
      logger.error({ text: '同步所有用户信息失败', data: {
        error: error.message,
        userId,
      } }, 'UserSyncModule')
    }
  }

  // 获取所有用户ID（当前用户 + 好友）
  private async getAllUserIds(): Promise<string[]> {
    const allUserIds: string[] = []

    try {
      logger.info({ text: '获取所有用户版本信息' }, 'UserSyncModule')

      // 调用好友服务的获取用户版本接口（一次性获取所有用户：当前用户 + 好友）
      const response = await friendUserVersionsApi({
        offset: 0,
        limit: 1000, // 设置一个足够大的limit来获取所有用户
      })

      if (response.result.userVersions && response.result.userVersions.length > 0) {
        // 收集所有用户ID（包含当前用户和好友）
        response.result.userVersions.forEach((item: any) => {
          allUserIds.push(item.userId)
        })
      }

      logger.info({
        text: '获取所有用户ID完成',
        data: { requested: response.result.total, received: allUserIds.length },
      }, 'UserSyncModule')
    }
    catch (error: any) {
      logger.error({ text: '获取所有用户ID失败', data: { error: error.message } }, 'UserSyncModule')
    }

    return allUserIds
  }

  // 批量同步多个用户信息
  async syncUsersByIds(userIds: string[]): Promise<void> {
    if (!userIds.length)
      return

    try {
      logger.info({ text: '批量同步用户信息', data: { count: userIds.length } }, 'UserSyncModule')

      // 调用用户服务的批量获取API
      const response = await userSyncByIdsApi({
        userIds,
        limit: 1000,
      })

      if (response.result.users && response.result.users.length > 0) {
        const usersModels = response.result.users.map((user: any) => ({
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

        // 批量更新本地用户数据
        await UserService.batchCreate(usersModels)

        logger.info({
          text: '批量用户信息同步成功',
          data: { requested: userIds.length, synced: usersModels.length },
        }, 'UserSyncModule')
      }
      else {
        logger.warn({ text: '服务器返回空的批量用户信息', data: { userIds: userIds.length } }, 'UserSyncModule')
      }
    }
    catch (error: any) {
      logger.error({ text: '批量同步用户信息失败', data: {
        count: userIds.length,
        error: error.message,
      } }, 'UserSyncModule')
      throw error
    }
  }
}

// 导出用户同步模块实例
export const userSyncModule = new UserSyncModule()
