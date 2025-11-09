import type { IDBGroupMember } from 'commonModule/type/database/group'
import { and, eq, gte, inArray, lte } from 'drizzle-orm'
import { groupMembers } from 'mainModule/database/tables/group/members'
import dbManager from '../../db'

// 群成员服务
export class GroupMemberService {
  static get db() {
    return dbManager.db
  }

  // 创建群成员
  static async create(memberData: any): Promise<any> {
    return await this.db.insert(groupMembers).values(memberData).run()
  }

  // 批量创建群成员（支持插入或更新）
  static async batchCreate(membersData: any[]): Promise<void> {
    if (membersData.length === 0)
      return

    for (const member of membersData) {
      // 映射服务器端字段名到数据库字段名，并只包含数据库表中存在的字段
      const dbMember = {
        groupId: member.groupId,
        userId: member.userId,
        role: member.role,
        status: member.status,
        joinTime: member.joinTime,
        version: member.version,
        createdAt: member.createAt,
        updatedAt: member.updateAt,
      }

      // 先尝试查找是否已存在
      const existing = await this.db
        .select()
        .from(groupMembers)
        .where(and(eq(groupMembers.groupId as any, dbMember.groupId as any), eq(groupMembers.userId as any, dbMember.userId as any)))
        .get()

      if (existing) {
        // 如果存在，更新
        await this.db
          .update(groupMembers)
          .set({
            role: dbMember.role,
            status: dbMember.status,
            version: dbMember.version,
            updatedAt: dbMember.updatedAt,
          })
          .where(eq(groupMembers.id, existing.id))
          .run()
      }
      else {
        // 如果不存在，插入
        await this.db
          .insert(groupMembers)
          .values(dbMember)
          .run()
      }
    }
  }

  // 获取群成员列表
  static async getGroupMembers(groupId: string): Promise<IDBGroupMember[]> {
    return await this.db.select().from(groupMembers).where(and(eq(groupMembers.groupId as any, groupId as any), eq(groupMembers.status as any, 1 as any))).all()
  }

  // 获取用户加入的群组列表
  static async getUserGroups(userId: string): Promise<IDBGroupMember[]> {
    return await this.db.select().from(groupMembers).where(and(eq(groupMembers.userId as any, userId as any), eq(groupMembers.status as any, 1 as any))).all()
  }

  // 按版本范围获取群成员（用于数据同步）
  static async getGroupMembersByVerRange(header: any, params: any): Promise<{ list: IDBGroupMember[] }> {
    const userId = String(header.userId)
    const { startVersion, endVersion } = params

    // 获取用户加入的群组
    const userGroups = await this.getUserGroups(userId)
    if (userGroups.length === 0) {
      return { list: [] }
    }

    const groupIds = userGroups.map(g => g.groupId)
    const members = await this.db.select().from(groupMembers).where(and(inArray(groupMembers.groupId as any, groupIds as any), gte(groupMembers.version as any, startVersion as any), lte(groupMembers.version as any, endVersion as any))).orderBy(groupMembers.version, 'asc').all()

    return { list: members }
  }

  // 删除指定群组的所有成员
  static async deleteGroupMembers(groupId: string): Promise<any> {
    return await this.db.delete(groupMembers).where(eq(groupMembers.groupId as any, groupId as any)).run()
  }
}
