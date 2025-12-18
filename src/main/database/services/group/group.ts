import type { IDBGroup } from 'commonModule/type/database/db/group'
import { eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { groups } from 'mainModule/database/tables/group/groups'

import type {
  DBCreateGroupReq,
  DBUpsertGroupReq,
  DBGetGroupReq,
  DBGetGroupRes,
  DBUpdateGroupReq,
  DBDeleteGroupReq,
  DBGetUserGroupsReq,
  DBGetUserGroupsRes,
  DBBatchCreateGroupsReq,
  DBBatchUpsertGroupsReq,
} from 'commonModule/type/database/server/group/group'

// 群组服务
class GroupService extends BaseService {
  /**
   * @description 创建群组
   */
  async create(req: DBCreateGroupReq): Promise<void> {
    await this.db.insert(groups).values(req).run()
  }

  /**
   * @description 创建或更新群组（upsert操作）
   */
  async upsert(req: DBUpsertGroupReq): Promise<void> {
    await this.db.insert(groups)
      .values(req)
      .onConflictDoUpdate({
        target: groups.groupId,
        set: {
          title: req.title,
          avatar: req.avatar,
          creatorId: req.creatorId,
          notice: req.notice,
          joinType: req.joinType,
          status: req.status,
          version: req.version,
          updatedAt: req.updatedAt,
        },
      })
      .run()
  }

  /**
   * @description 批量创建群组（支持插入或更新）
   */
  async batchCreate(req: DBBatchCreateGroupsReq): Promise<void> {
    if (req.groups.length === 0)
      return

    // 使用插入或更新的方式来避免唯一约束冲突
    for (const group of req.groups) {
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

  /**
   * @description 批量插入或更新群组（基于版本号判断是否需要更新）
   */
  async batchUpsert(req: DBBatchUpsertGroupsReq): Promise<void> {
    if (req.groups.length === 0)
      return

    for (const group of req.groups) {
      // 获取本地群组数据
      const localGroup = await this.getGroupById(group.groupId)

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
   async getGroupById(groupId: string): Promise<IDBGroup | undefined> {
    return await this.db.select().from(groups).where(eq(groups.groupId as any, groupId as any)).get()
  }

  // 根据GroupID列表批量获取群组
   async getGroupsByIds(groupIds: string[]): Promise<IDBGroup[]> {
    if (groupIds.length === 0)
      return []
    return await this.db.select().from(groups).where(inArray(groups.groupId as any, groupIds as any)).all()
  }

  // 更新群组信息
   async updateGroup(groupId: string, updateData: any): Promise<any> {
    updateData.updatedAt = Math.floor(Date.now() / 1000)
    return await this.db.update(groups).set(updateData).where(eq(groups.groupId as any, groupId as any)).run()
  }

  // 删除群组
   async deleteGroup(groupId: string): Promise<any> {
    return await this.db.delete(groups).where(eq(groups.groupId as any, groupId as any)).run()
  }
}

export default new GroupService()