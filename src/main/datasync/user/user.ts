import type { IDataBaseUserModel } from 'commonModule/type/database'
import { EDataType } from 'commonModule/type/ajax/datasync'
import { SyncStatus } from 'commonModule/type/datasync'
import { getSyncCursorApi, updateSyncCursorApi } from 'mainModule/api/datasync'
import { userSyncApi, userSyncByIdsApi } from 'mainModule/api/user'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { UserService } from 'mainModule/database/services/user/user'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 用户数据同步模块
export class UserSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取服务器和本地版本号
      const serverCursor = await getSyncCursorApi({ dataType: EDataType.USERS })
      const localCursor = await DataSyncService.get(userId, process.custom.DEVICE_ID, EDataType.USERS)

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
      logger.error({ text: '用户同步失败', data: { error: (error as any)?.message } }, 'UserSyncModule')
    }
  }

  // 同步指定用户ID列表的用户信息（大厂做法：关系触发同步）
  async syncUsersByIds(userIds: string[]) {
    if (!userIds.length)
      return

    try {
      logger.info({ text: '开始通过IDs同步用户信息', data: { userIds } }, 'UserSyncModule')

      const response = await userSyncByIdsApi({
        userIds, // 使用新的专用接口
        limit: 1000, // 批量同步，不分页
      })

      if (response.result.users.length > 0) {
        const usersModels = response.result.users.map((user: any) => {
          const userModel: IDataBaseUserModel = {
            uuid: user.userId,
            nickName: user.nickname,
            avatar: user.avatar,
            abstract: user.abstract,
            phone: user.phone,
            email: user.email,
            gender: user.gender,
            status: user.status,
            createdAt: user.createAt,
            version: user.version,
            updatedAt: user.updateAt,
          }
          return userModel
        })

        // 批量插入/更新用户数据
        await UserService.batchCreate(usersModels)

        logger.info({ text: '通过IDs同步用户信息完成', data: { count: usersModels.length } }, 'UserSyncModule')
      }
    }
    catch (error) {
      logger.error({ text: '通过IDs同步用户信息失败', data: { error: (error as any)?.message, userIds } }, 'UserSyncModule')
      throw error
    }
  }

  // 同步用户数据
  async sync(fromVersion: number, toVersion: number) {
    logger.info({ text: '开始同步用户数据', data: { fromVersion, toVersion } }, 'UserSyncModule')

    let currentVersion = fromVersion
    while (currentVersion <= toVersion) {
      const response = await userSyncApi({
        fromVersion: currentVersion,
        toVersion,
        limit: 100,
      })

      if (response.result.users.length > 0) {
        const usersModels = response.result.users.map((user: any) => {
          const userModel: IDataBaseUserModel = {
            uuid: user.userId,
            nickName: user.nickname,
            avatar: user.avatar,
            abstract: user.abstract,
            phone: user.phone,
            email: user.email,
            gender: user.gender,
            status: user.status,
            createdAt: user.createAt,
            version: user.version,
            updatedAt: user.updateAt,
          }
          return userModel
        })

        // 批量插入用户数据
        await UserService.batchCreate(usersModels)

        // 更新到服务器返回的nextVersion
        currentVersion = response.result.nextVersion
      }
      else {
        break
      }
    }

    logger.info({ text: '用户数据同步完成', data: { fromVersion, toVersion } }, 'UserSyncModule')
  }

  // 更新游标
  private async updateCursor(userId: string, lastVersion: number) {
    await DataSyncService.upsert({
      userId,
      deviceId: process.custom.DEVICE_ID,
      dataType: EDataType.USERS,
      lastSeq: lastVersion,
      syncStatus: SyncStatus.COMPLETED,
    })

    await updateSyncCursorApi({
      dataType: EDataType.USERS,
      lastSeq: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出用户同步模块实例
export const userSyncModule = new UserSyncModule()
