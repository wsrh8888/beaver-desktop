import type { IDBGroup } from 'commonModule/type/database/group'
import { eq, inArray } from 'drizzle-orm'
import { groups } from 'mainModule/database/tables/group/groups'
import dbManager from '../../db'

// 群组服务
export class GroupService {
  static get db() {
    return dbManager.db
  }

  // 创建群组
  static async create(groupData: any): Promise<any> {
    return await this.db.insert(groups).values(groupData).run()
  }

  // 创建或更新群组（upsert操作）
  static async upsert(groupData: any): Promise<any> {
    return await this.db.insert(groups)
      .values(groupData)
      .onConflictDoUpdate({
        target: groups.groupId,
        set: {
          title: groupData.title,
          avatar: groupData.avatar,
          creatorId: groupData.creatorId,
          notice: groupData.notice,
          joinType: groupData.joinType,
          status: groupData.status,
          version: groupData.version,
          updatedAt: groupData.updatedAt,
        },
      })
      .run()
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
          target: groups.groupId,
          set: {
            title: group.title,
            avatar: group.avatar,
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

  // 批量插入或更新群组（基于版本号判断是否需要更新）
  static async batchUpsert(groupsData: any[]): Promise<void> {
    if (groupsData.length === 0)
      return

    for (const group of groupsData) {
      // 获取本地群组数据
      const localGroup = await this.getGroupByUuid(group.groupId)

      // 如果本地不存在或版本号不同，则更新
      if (!localGroup || localGroup.version !== group.version) {
        await this.db
          .insert(groups)
          .values(group)
          .onConflictDoUpdate({
            target: groups.groupId,
            set: {
              title: group.title,
              avatar: group.avatar,
              creatorId: group.creatorId,
              notice: group.notice,
              joinType: group.joinType,
              status: group.status,
              version: group.version, // 也要更新版本号
              updatedAt: group.updatedAt,
            },
          })
          .run()
      }
    }
  }

  // 根据GroupID获取群组
  static async getGroupByUuid(groupId: string): Promise<IDBGroup | undefined> {
    return await this.db.select().from(groups).where(eq(groups.groupId as any, groupId as any)).get()
  }

  // 根据GroupID列表批量获取群组
  static async getGroupsByUuids(groupIds: string[]): Promise<IDBGroup[]> {
    if (groupIds.length === 0)
      return []
    return await this.db.select().from(groups).where(inArray(groups.groupId as any, groupIds as any)).all()
  }

  // 更新群组信息
  static async updateGroup(groupId: string, updateData: any): Promise<any> {
    updateData.updatedAt = Math.floor(Date.now() / 1000)
    return await this.db.update(groups).set(updateData).where(eq(groups.groupId as any, groupId as any)).run()
  }

  // 删除群组
  static async deleteGroup(groupId: string): Promise<any> {
    return await this.db.delete(groups).where(eq(groups.groupId as any, groupId as any)).run()
  }
}
