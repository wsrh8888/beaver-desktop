// 群组同步状态服务 - 使用独立的groupSyncStatus表
import { and, eq } from 'drizzle-orm'
import dbManager from '../../db'
import { groupSyncStatus } from '../../tables/group/sync-status'

export class GroupSyncStatusService {
  static get db() {
    return dbManager.db
  }

  // 获取群组同步状态 - 返回组合对象
  static async getGroupSyncStatus(groupId: string) {
    const [infoStatus, membersStatus, requestsStatus] = await Promise.all([
      this.getSyncStatus('info', groupId),
      this.getSyncStatus('members', groupId),
      this.getSyncStatus('requests', groupId),
    ])

    if (!infoStatus && !membersStatus && !requestsStatus) {
      return undefined
    }

    return {
      groupId,
      groupVersion: infoStatus?.version || 0,
      memberVersion: membersStatus?.version || 0,
      requestVersion: requestsStatus?.version || 0,
      createdAt: infoStatus?.createdAt || Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    }
  }

  // 获取指定模块的同步状态
  static async getSyncStatus(module: string, groupId: string) {
    return await this.db.select().from(groupSyncStatus).where(and(eq(groupSyncStatus.module, module), eq(groupSyncStatus.groupId, groupId))).get()
  }

  // 批量获取群组同步状态
  static async getGroupsSyncStatus(groupIds: string[]) {
    const results = []
    for (const groupId of groupIds) {
      const status = await this.getGroupSyncStatus(groupId)
      if (status) {
        results.push(status)
      }
    }
    return results
  }

  // 获取所有群组同步状态
  static async getAllGroupsSyncStatus() {
    const allStatuses = await this.db.select().from(groupSyncStatus).all()

    // 按groupId分组
    const groupedStatuses = new Map<string, any>()

    for (const status of allStatuses) {
      const groupId = status.groupId
      if (!groupedStatuses.has(groupId)) {
        groupedStatuses.set(groupId, { groupId })
      }
      const groupStatus = groupedStatuses.get(groupId)!

      if (status.module === 'info') {
        groupStatus.groupVersion = status.version || 0
      }
      else if (status.module === 'members') {
        groupStatus.memberVersion = status.version || 0
      }
      else if (status.module === 'requests') {
        groupStatus.requestVersion = status.version || 0
      }
      groupStatus.createdAt = status.createdAt
      groupStatus.updatedAt = status.updatedAt
    }

    return Array.from(groupedStatuses.values())
  }

  // 更新或插入群组同步状态
  static async upsertGroupSyncStatus(groupId: string, groupVersion: number, memberVersion: number, requestVersion: number): Promise<void> {
    await Promise.all([
      this.upsertSyncStatus('info', groupId, groupVersion),
      this.upsertSyncStatus('members', groupId, memberVersion),
      this.upsertSyncStatus('requests', groupId, requestVersion),
    ])
  }

  // 更新指定模块的同步状态
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

  // 批量更新群组同步状态
  static async batchUpsertGroupSyncStatus(statuses: Array<{ groupId: string, groupVersion: number, memberVersion: number, requestVersion: number }>): Promise<void> {
    for (const status of statuses) {
      await this.upsertGroupSyncStatus(status.groupId, status.groupVersion, status.memberVersion, status.requestVersion)
    }
  }

  // 删除群组同步状态
  static async deleteGroupSyncStatus(groupId: string): Promise<any> {
    return await this.db.delete(groupSyncStatus)
      .where(eq(groupSyncStatus.groupId, groupId))
      .run()
  }

  // 清空所有同步状态（用于重置）
  static async clearAllSyncStatus(): Promise<any> {
    return await this.db.delete(groupSyncStatus).run()
  }
}
