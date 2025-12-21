import type { IGroupInfo } from 'commonModule/type/ajax/group'
import type { IDBGroupMember } from 'commonModule/type/database/db/group'
import { and, eq, gte, inArray, lte } from 'drizzle-orm'
import { BaseService } from '../base'
import { groups } from 'mainModule/database/tables/group/groups'
import { groupMembers } from 'mainModule/database/tables/group/members'
import type {
  DBAddGroupMemberReq,
  DBBatchAddGroupMembersReq,
  DBGetGroupMembersReq,
  DBGetGroupMembersRes,
  DBGetUserMembershipsReq,
  DBGetUserMembershipsRes,
  DBUpdateGroupMemberReq,
  DBRemoveGroupMemberReq,
} from 'commonModule/type/database/server/group/group-member'

// 群成员服务
class GroupMember extends BaseService {

  /**
   * @description 创建或更新群成员（upsert操作）
   */
  async upsert(req: DBAddGroupMemberReq): Promise<void> {
    // 先尝试查找是否已存在
    const existing = await this.db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId as any, req.groupId), eq(groupMembers.userId as any, req.userId)))
      .get()

    if (existing && existing.id) {
      // 如果存在，更新
      await this.db
        .update(groupMembers)
        .set({
          role: req.role,
          status: req.status,
          joinTime: req.joinTime,
          version: req.version,
          updatedAt: req.updatedAt,
        })
        .where(eq(groupMembers.id as any, existing.id))
        .run()
    }
    else {
      // 如果不存在，插入
      await this.db
        .insert(groupMembers)
        .values(req)
        .run()
    }
  }

  /**
   * @description 批量创建群成员（支持插入或更新）
   */
  async batchCreate(req: DBBatchAddGroupMembersReq): Promise<void> {
    if (req.members.length === 0)
      return

    for (const member of req.members) {
      // 先尝试查找是否已存在
      const existing = await this.db
        .select()
        .from(groupMembers)
        .where(and(eq(groupMembers.groupId as any, member.groupId), eq(groupMembers.userId as any, member.userId)))
        .get()

      if (existing && existing.id) {
        // 如果存在，更新
        await this.db
          .update(groupMembers)
          .set({
            role: member.role,
            status: member.status,
            version: member.version,
            updatedAt: member.updatedAt,
          })
          .where(eq(groupMembers.id as any, existing.id))
          .run()
      }
      else {
        // 如果不存在，插入
        await this.db
          .insert(groupMembers)
          .values(member)
          .run()
      }
    }
  }

  /**
   * @description 获取群成员列表（纯数据库查询，不含业务逻辑）
   */
  async getGroupMembers(req: DBGetGroupMembersReq): Promise<DBGetGroupMembersRes> {
    return await this.db.select().from(groupMembers).where(and(eq(groupMembers.groupId as any, req.groupId), eq(groupMembers.status as any, 1))).all()
  }

  /**
   * @description 获取用户加入的群组成员记录（纯数据库查询，不含业务逻辑）
   */
  async getUserMemberships(req: DBGetUserMembershipsReq): Promise<DBGetUserMembershipsRes> {
    return await this.db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.userId as any, req.userId),
        eq(groupMembers.status as any, 1),
      ))
      .all()
  }

}

export default new GroupMember()
