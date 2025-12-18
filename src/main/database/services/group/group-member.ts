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
   * @description 创建群成员
   */
  async create(req: DBAddGroupMemberReq): Promise<void> {
    await this.db.insert(groupMembers).values(req).run()
  }

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
    const members = await this.db.select().from(groupMembers).where(and(eq(groupMembers.groupId as any, req.groupId), eq(groupMembers.status as any, 1))).all()
    return { members }
  }

  /**
   * @description 获取用户加入的群组成员记录（纯数据库查询，不含业务逻辑）
   */
  async getUserMemberships(req: DBGetUserMembershipsReq): Promise<DBGetUserMembershipsRes> {
    const memberships = await this.db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.userId as any, req.userId),
        eq(groupMembers.status as any, 1),
      ))
      .all()
    return { memberships }
  }

  // 获取用户加入的群组列表（包含群组详细信息）- 已废弃，请使用业务层
   async getUserGroups(userId: string): Promise<IGroupInfo[]> {
    // 1. 获取用户加入的群组成员记录
    const userMemberships = await this.db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.userId as any, userId as any),
        eq(groupMembers.status as any, 1),
      ))
      .all()

    if (userMemberships.length === 0) {
      return []
    }

    // 2. 提取群组ID列表
    const groupIds = userMemberships.map((membership: any) => membership.groupId)

    // 3. 获取这些群组的详细信息
    const groupDetails = await this.db
      .select()
      .from(groups)
      .where(inArray(groups.groupId as any, groupIds as any))
      .all()

    // 5. 组装返回数据
    return groupDetails.map((group: any) => {
      return {
        title: group.title || '',
        avatar: group.avatar || '',
        conversationId: `group_${group.groupId}`,
        version: group.version || 0,
      }
    })
  }

  // 按版本范围获取群成员（用于数据同步）
   async getGroupMembersByVerRange(header: any, params: any): Promise<{ list: IDBGroupMember[] }> {
    const userId = String(header.userId)
    const { startVersion, endVersion } = params

    // 获取用户加入的群组成员记录
    const userMemberships = await this.db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.userId as any, userId as any),
        eq(groupMembers.status as any, 1),
      ))
      .all()

    if (userMemberships.length === 0) {
      return { list: [] }
    }

    const groupIds = userMemberships.map((m: any) => m.groupId)
    const members = await this.db
      .select()
      .from(groupMembers)
      .where(and(
        inArray(groupMembers.groupId as any, groupIds as any),
        gte(groupMembers.version as any, startVersion),
        lte(groupMembers.version as any, endVersion),
      ))
      .orderBy(groupMembers.version, 'asc')
      .all()

    return { list: members }
  }

  // 删除指定群组的所有成员
   async deleteGroupMembers(groupId: string): Promise<any> {
    return await this.db.delete(groupMembers).where(eq(groupMembers.groupId as any, groupId as any)).run()
  }
}

export default new GroupMember()
