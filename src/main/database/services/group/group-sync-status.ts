// 群组同步状态服务 - 使用独立的groupSyncStatus表
import { and, eq, inArray } from 'drizzle-orm'
import dbManager from '../../db'
import { groupSyncStatus } from '../../tables/group/sync-status'

export class GroupSyncStatusService {
  static get db() {
    return dbManager.db
  }

  /**
   * 批量获取指定模块的版本状态
   */
  static async getModuleVersions(module: string, groupIds: string[]): Promise<Array<{ groupId: string, version: number }>> {
    if (groupIds.length === 0) {
      return []
    }

    const statuses = await this.db.select()
      .from(groupSyncStatus)
      .where(and(eq(groupSyncStatus.module, module), inArray(groupSyncStatus.groupId, groupIds)))

    return statuses.map(status => ({
      groupId: status.groupId,
      version: status.version || 0,
    }))
  }

  /**
   * 更新指定模块的同步状态
   */
  static async upsertSyncStatus(module: string, groupId: string, version: number): Promise<void> {
    await this.db
      .insert(groupSyncStatus)
      .values({
        module,
        groupId,
        version,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: [groupSyncStatus.groupId, groupSyncStatus.module],
        set: {
          version,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }
}
