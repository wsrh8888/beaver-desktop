import type { IDBUserSyncStatus } from 'commonModule/type/database/db/user'
import { eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { userSyncStatus } from '../../tables/user/sync-status'
import type {
  DBGetUserSyncStatusReq,
  DBGetUserSyncStatusRes,
  DBGetUsersSyncStatusReq,
  DBGetUsersSyncStatusRes,
  DBGetAllUsersSyncStatusReq,
  DBGetAllUsersSyncStatusRes,
  DBUpsertUserSyncStatusReq,
  DBBatchUpsertUserSyncStatusReq,
  DBDeleteUserSyncStatusReq,
  DBBatchDeleteUserSyncStatusReq,
  DBClearAllSyncStatusReq,
  DBGetUsersNeedSyncReq,
  DBGetUsersNeedSyncRes,
} from 'commonModule/type/database/server/user/sync-status'

// 用户同步状态服务
class UserSyncStatusService extends BaseService {
  /**
   * @description 获取用户同步状态
   */
  async getUserSyncStatus(req: DBGetUserSyncStatusReq): Promise<DBGetUserSyncStatusRes> {
    const syncStatus = await this.db.select().from(userSyncStatus).where(eq(userSyncStatus.userId, req.userId)).get()
    return { syncStatus }
  }

  /**
   * @description 批量获取用户同步状态
   */
  async getUsersSyncStatus(req: DBGetUsersSyncStatusReq): Promise<DBGetUsersSyncStatusRes> {
    if (req.userIds.length === 0)
      return { syncStatuses: [] }
    const syncStatuses = await this.db.select().from(userSyncStatus).where(inArray(userSyncStatus.userId, req.userIds)).all()
    return { syncStatuses }
  }

  /**
   * @description 获取所有用户同步状态
   */
  async getAllUsersSyncStatus(req: DBGetAllUsersSyncStatusReq): Promise<DBGetAllUsersSyncStatusRes> {
    const syncStatuses = await this.db.select().from(userSyncStatus).all()
    return { syncStatuses }
  }

  // 更新或插入用户同步状态
   async upsertUserSyncStatus(
    userId: string,
    userVersion: number,
  ): Promise<void> {
    await this.db
      .insert(userSyncStatus)
      .values({
        userId,
        userVersion,
        lastSyncTime: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: userSyncStatus.userId,
        set: {
          userVersion,
          lastSyncTime: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  // 批量更新用户同步状态
   async batchUpsertUserSyncStatus(statuses: Array<{
    userId: string
    userVersion: number
  }>): Promise<void> {
    for (const status of statuses) {
      await this.upsertUserSyncStatus(
        status.userId,
        status.userVersion,
      )
    }
  }

  // 删除用户同步状态
   async deleteUserSyncStatus(userId: string): Promise<any> {
    return await this.db.delete(userSyncStatus).where(eq(userSyncStatus.userId, userId)).run()
  }

  // 批量删除用户同步状态
   async batchDeleteUserSyncStatus(userIds: string[]): Promise<any> {
    return await this.db.delete(userSyncStatus).where(inArray(userSyncStatus.userId, userIds)).run()
  }

  // 清空所有同步状态（用于重置）
   async clearAllSyncStatus(): Promise<any> {
    return await this.db.delete(userSyncStatus).run()
  }

  // 获取需要同步的用户列表
   async getUsersNeedSync(serverVersions: Record<string, number>): Promise<string[]> {
    const localStatuses = await this.getAllUsersSyncStatus()
    const statusMap = new Map(localStatuses.map(s => [s.userId, s]))

    const needSync: string[] = []

    for (const [userId, serverVersion] of Object.entries(serverVersions)) {
      const localStatus = statusMap.get(userId)
      const localVersion = localStatus?.userVersion || 0

      if (localVersion < serverVersion) {
        needSync.push(userId)
      }
    }

    return needSync
  }
}

// 导出用户同步状态服务实例
export default new UserSyncStatusService()
