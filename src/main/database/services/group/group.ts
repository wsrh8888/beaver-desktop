import type { IDBGroup } from 'commonModule/type/database/group'
import { eq, inArray } from 'drizzle-orm'
import dbManager from '../../db'
import { groups } from '../../tables/group/group'

// 群组服务
export class GroupService {
  static get db() {
    return dbManager.db
  }

  // 创建群组
  static async create(groupData: any): Promise<any> {
    return await this.db.insert(groups).values(groupData).run()
  }

  // 批量创建群组（支持插入或更新）
  static async batchCreate(groupsData: any[]): Promise<void> {
    if (groupsData.length === 0)
      return

    // 使用插入或更新的方式来避免唯一约束冲突
    for (const group of groupsData) {
      await this.db
        .insert(groups)
        .values(group)
        .onConflictDoUpdate({
          target: groups.uuid,
          set: {
            type: group.type,
            title: group.title,
            fileName: group.fileName,
            creatorId: group.creatorId,
            notice: group.notice,
            joinType: group.joinType,
            status: group.status,
            updatedAt: group.updatedAt,
          },
        })
        .run()
    }
  }

  // 根据UUID获取群组
  static async getGroupByUuid(uuid: string): Promise<IDBGroup | undefined> {
    return await this.db.select().from(groups).where(eq(groups.uuid as any, uuid as any)).get()
  }

  // 根据UUID列表批量获取群组
  static async getGroupsByUuids(uuids: string[]): Promise<IDBGroup[]> {
    if (uuids.length === 0)
      return []
    return await this.db.select().from(groups).where(inArray(groups.uuid as any, uuids as any)).all()
  }

  // 更新群组信息
  static async updateGroup(uuid: string, updateData: any): Promise<any> {
    updateData.updatedAt = Math.floor(Date.now() / 1000)
    return await this.db.update(groups).set(updateData).where(eq(groups.uuid as any, uuid as any)).run()
  }

  // 删除群组
  static async deleteGroup(uuid: string): Promise<any> {
    return await this.db.delete(groups).where(eq(groups.uuid as any, uuid as any)).run()
  }
}
