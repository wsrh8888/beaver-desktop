import type { IDBGroupJoinRequest } from 'commonModule/type/database/group'
import { and, eq, gte, inArray, lte } from 'drizzle-orm'
import dbManager from '../../db'
import { groupJoinRequests } from '../../tables/group/group'
import { GroupMemberService } from './group-member'

// 入群申请服务
export class GroupJoinRequestService {
  static get db() {
    return dbManager.db
  }

  // 创建入群申请
  static async create(requestData: any): Promise<any> {
    return await this.db.insert(groupJoinRequests).values(requestData).run()
  }

  // 批量创建入群申请（支持插入或更新）
  static async batchCreate(requestsData: any[]): Promise<void> {
    if (requestsData.length === 0)
      return

    for (const request of requestsData) {
      await this.db
        .insert(groupJoinRequests)
        .values(request)
        .onConflictDoUpdate({
          target: groupJoinRequests.id,
          set: {
            status: request.status,
            handledBy: request.handledBy,
            handledAt: request.handledAt,
            version: request.version,
            updatedAt: request.updatedAt,
          },
        })
        .run()
    }
  }

  // 按版本范围获取入群申请（用于数据同步）
  static async getGroupJoinRequestsByVerRange(header: any, params: any): Promise<{ list: IDBGroupJoinRequest[] }> {
    const userId = String(header.userId)
    const { startVersion, endVersion } = params

    // 获取用户管理的群组（群主或管理员）
    const userGroups = await GroupMemberService.getUserGroups(userId)
    const managedGroups = userGroups.filter(g => g.role === 1 || g.role === 2) // 1群主 2管理员

    if (managedGroups.length === 0) {
      return { list: [] }
    }

    const groupIds = managedGroups.map(g => g.groupId)
    const requests = await this.db.select().from(groupJoinRequests).where(and(inArray(groupJoinRequests.groupId as any, groupIds as any), gte(groupJoinRequests.version as any, startVersion as any), lte(groupJoinRequests.version as any, endVersion as any))).orderBy(groupJoinRequests.version, 'asc').all()

    return { list: requests }
  }

  // 删除指定群组的所有入群申请
  static async deleteGroupRequests(groupId: string): Promise<any> {
    return await this.db.delete(groupJoinRequests).where(eq(groupJoinRequests.groupId as any, groupId as any)).run()
  }
}
