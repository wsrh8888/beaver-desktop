// 好友同步状态服务 - 使用独立的friendSyncStatus表
import { eq, inArray } from 'drizzle-orm'
import dbManager from '../../db'
import { friendSyncStatus } from '../../tables/friend/sync-status'

export class FriendSyncStatusService {
  static get db() {
    return dbManager.db
  }

  // 获取好友同步状态
  static async getFriendSyncStatus(friendId: string) {
    return await this.db.select().from(friendSyncStatus).where(eq(friendSyncStatus.friendId, friendId)).get()
  }

  // 批量获取好友同步状态
  static async getFriendsSyncStatus(friendIds: string[]) {
    if (friendIds.length === 0)
      return []
    return await this.db.select().from(friendSyncStatus).where(inArray(friendSyncStatus.friendId, friendIds)).all()
  }

  // 获取所有好友同步状态
  static async getAllFriendsSyncStatus() {
    return await this.db.select().from(friendSyncStatus).all()
  }

  // 更新或插入好友同步状态
  static async upsertFriendSyncStatus(friendId: string, version: number): Promise<void> {
    await this.db
      .insert(friendSyncStatus)
      .values({
        friendId,
        version,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: friendSyncStatus.friendId,
        set: {
          version,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  // 批量更新好友同步状态
  static async batchUpsertFriendSyncStatus(statuses: Array<{ friendId: string, version: number }>): Promise<void> {
    for (const status of statuses) {
      await this.upsertFriendSyncStatus(status.friendId, status.version)
    }
  }

  // 删除好友同步状态
  static async deleteFriendSyncStatus(friendId: string): Promise<any> {
    return await this.db.delete(friendSyncStatus)
      .where(eq(friendSyncStatus.friendId, friendId))
      .run()
  }

  // 批量删除好友同步状态
  static async batchDeleteFriendSyncStatus(friendIds: string[]): Promise<any> {
    if (friendIds.length === 0)
      return
    return await this.db.delete(friendSyncStatus)
      .where(inArray(friendSyncStatus.friendId, friendIds))
      .run()
  }

  // 获取需要同步的好友列表
  static async getFriendsNeedSync(serverVersions: Record<string, number>): Promise<string[]> {
    const localStatuses = await this.getAllFriendsSyncStatus()
    const statusMap = new Map(localStatuses.map(s => [s.friendId, s]))

    const needSync: string[] = []

    for (const [friendId, serverVersion] of Object.entries(serverVersions)) {
      const localStatus = statusMap.get(friendId)
      const localVersion = localStatus?.version || 0

      if (localVersion < serverVersion) {
        needSync.push(friendId)
      }
    }

    return needSync
  }

  // 清空所有同步状态（用于重置）
  static async clearAllSyncStatus(): Promise<any> {
    return await this.db.delete(friendSyncStatus).run()
  }
}

export default FriendSyncStatusService

// 好友验证同步状态服务
export class FriendVerifySyncStatusService {
  static get db() {
    return dbManager.db
  }

  // 获取好友验证同步状态
  static async getFriendVerifySyncStatus(uuid: string) {
    return await this.db.select().from(friendSyncStatus).where(eq(friendSyncStatus.friendId, uuid)).get()
  }

  // 批量获取好友验证同步状态
  static async getFriendVerifiesSyncStatus(uuids: string[]) {
    if (uuids.length === 0)
      return []
    return await this.db.select().from(friendSyncStatus).where(inArray(friendSyncStatus.friendId, uuids)).all()
  }

  // 获取所有好友验证同步状态
  static async getAllFriendVerifiesSyncStatus() {
    return await this.db.select().from(friendSyncStatus).all()
  }

  // 更新或插入好友验证同步状态
  static async upsertFriendVerifySyncStatus(uuid: string, version: number): Promise<void> {
    await this.db
      .insert(friendSyncStatus)
      .values({
        friendId: uuid,
        version,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: friendSyncStatus.friendId,
        set: {
          version,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  // 批量更新好友验证同步状态
  static async batchUpsertFriendVerifySyncStatus(statuses: Array<{ uuid: string, version: number }>): Promise<void> {
    for (const status of statuses) {
      await this.upsertFriendVerifySyncStatus(status.uuid, status.version)
    }
  }

  // 删除好友验证同步状态
  static async deleteFriendVerifySyncStatus(uuid: string): Promise<any> {
    return await this.db.delete(friendSyncStatus)
      .where(eq(friendSyncStatus.friendId, uuid))
      .run()
  }

  // 批量删除好友验证同步状态
  static async batchDeleteFriendVerifySyncStatus(uuids: string[]): Promise<any> {
    if (uuids.length === 0)
      return
    return await this.db.delete(friendSyncStatus)
      .where(inArray(friendSyncStatus.friendId, uuids))
      .run()
  }

  // 获取需要同步的好友验证列表
  static async getFriendVerifiesNeedSync(serverVersions: Record<string, number>): Promise<string[]> {
    const localStatuses = await this.getAllFriendVerifiesSyncStatus()
    const statusMap = new Map(localStatuses.map(s => [s.friendId, s]))

    const needSync: string[] = []

    for (const [uuid, serverVersion] of Object.entries(serverVersions)) {
      const localStatus = statusMap.get(uuid)
      const localVersion = localStatus?.version || 0

      if (localVersion < serverVersion) {
        needSync.push(uuid)
      }
    }

    return needSync
  }

  // 清空所有同步状态（用于重置）
  static async clearAllFriendVerifySyncStatus(): Promise<any> {
    return await this.db.delete(friendSyncStatus).run()
  }
}
