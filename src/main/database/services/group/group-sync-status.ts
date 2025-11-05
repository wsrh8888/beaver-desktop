import type { IDBGroupSyncStatus } from 'commonModule/type/database/group'
import { eq, inArray } from 'drizzle-orm'
import dbManager from '../../db'
import { groupSyncStatus } from '../../tables/group/group'

// 群组同步状态服务
export class GroupSyncStatusService {
  static get db() {
    return dbManager.db
  }

  // 获取群组同步状态
  static async getGroupSyncStatus(groupId: string): Promise<IDBGroupSyncStatus | undefined> {
    return await this.db.select().from(groupSyncStatus).where(eq(groupSyncStatus.groupId as any, groupId as any)).get()
  }

  // 批量获取群组同步状态
  static async getGroupsSyncStatus(groupIds: string[]): Promise<IDBGroupSyncStatus[]> {
    if (groupIds.length === 0)
      return []
    return await this.db.select().from(groupSyncStatus).where(inArray(groupSyncStatus.groupId as any, groupIds as any)).all()
  }

  // 获取所有群组同步状态
  static async getAllGroupsSyncStatus(): Promise<IDBGroupSyncStatus[]> {
    return await this.db.select().from(groupSyncStatus).all()
  }

  // 更新或插入群组同步状态
  static async upsertGroupSyncStatus(groupId: string, groupVersion: number, memberVersion: number, requestVersion: number): Promise<void> {
    await this.db
      .insert(groupSyncStatus)
      .values({
        groupId,
        groupVersion,
        memberVersion,
        requestVersion,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: groupSyncStatus.groupId,
        set: {
          groupVersion,
          memberVersion,
          requestVersion,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  // 批量更新群组同步状态
  static async batchUpsertGroupSyncStatus(statuses: Array<{ groupId: string, groupVersion: number, memberVersion: number, requestVersion: number }>): Promise<void> {
    for (const status of statuses) {
      await this.upsertGroupSyncStatus(status.groupId, status.groupVersion, status.memberVersion, status.requestVersion)
    }
  }

  // 删除群组同步状态
  static async deleteGroupSyncStatus(groupId: string): Promise<any> {
    return await this.db.delete(groupSyncStatus).where(eq(groupSyncStatus.groupId as any, groupId as any)).run()
  }

  // 清空所有同步状态（用于重置）
  static async clearAllSyncStatus(): Promise<any> {
    return await this.db.delete(groupSyncStatus).run()
  }
}
