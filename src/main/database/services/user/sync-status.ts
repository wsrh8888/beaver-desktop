import type { IDBUserSyncStatus } from 'commonModule/type/database/user'
import { eq, inArray } from 'drizzle-orm'
import dbManager from '../../db'
import { userSyncStatus } from '../../tables/user/sync-status'

// 用户同步状态服务
export class UserSyncStatusService {
  static get db() {
    return dbManager.db
  }

  // 获取用户同步状态
  static async getUserSyncStatus(userId: string): Promise<IDBUserSyncStatus | undefined> {
    return await this.db.select().from(userSyncStatus).where(eq(userSyncStatus.userId, userId)).get()
  }

  // 批量获取用户同步状态
  static async getUsersSyncStatus(userIds: string[]): Promise<IDBUserSyncStatus[]> {
    if (userIds.length === 0)
      return []
    return await this.db.select().from(userSyncStatus).where(inArray(userSyncStatus.userId, userIds)).all()
  }

  // 获取所有用户同步状态
  static async getAllUsersSyncStatus(): Promise<IDBUserSyncStatus[]> {
    return await this.db.select().from(userSyncStatus).all()
  }

  // 更新或插入用户同步状态
  static async upsertUserSyncStatus(
    userId: string,
    userVersion: number,
    syncStatus: string = 'completed',
    retryCount: number = 0,
  ): Promise<void> {
    await this.db
      .insert(userSyncStatus)
      .values({
        userId,
        userVersion,
        syncStatus,
        retryCount,
        lastSyncTime: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: userSyncStatus.userId,
        set: {
          userVersion,
          syncStatus,
          retryCount,
          lastSyncTime: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  // 批量更新用户同步状态
  static async batchUpsertUserSyncStatus(statuses: Array<{
    userId: string
    userVersion: number
    syncStatus?: string
    retryCount?: number
  }>): Promise<void> {
    for (const status of statuses) {
      await this.upsertUserSyncStatus(
        status.userId,
        status.userVersion,
        status.syncStatus || 'completed',
        status.retryCount || 0,
      )
    }
  }

  // 删除用户同步状态
  static async deleteUserSyncStatus(userId: string): Promise<any> {
    return await this.db.delete(userSyncStatus).where(eq(userSyncStatus.userId, userId)).run()
  }

  // 批量删除用户同步状态
  static async batchDeleteUserSyncStatus(userIds: string[]): Promise<any> {
    return await this.db.delete(userSyncStatus).where(inArray(userSyncStatus.userId, userIds)).run()
  }

  // 清空所有同步状态（用于重置）
  static async clearAllSyncStatus(): Promise<any> {
    return await this.db.delete(userSyncStatus).run()
  }

  // 获取需要同步的用户列表
  static async getUsersNeedSync(serverVersions: Record<string, number>): Promise<string[]> {
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
export default UserSyncStatusService
