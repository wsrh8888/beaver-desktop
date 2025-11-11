import type { IGroupJoinRequestListRes } from 'commonModule/type/ajax/group'
import type { IDBGroupJoinRequest } from 'commonModule/type/database/group'
import { and, eq, gte, inArray, lte } from 'drizzle-orm'
import { groupJoinRequests } from 'mainModule/database/tables/group/join-requests'
import { groupMembers } from 'mainModule/database/tables/group/members'
import dbManager from '../../db'
import { UserService } from '../user/user'

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
      // 先检查是否已存在相同的申请
      const existing = await this.db
        .select()
        .from(groupJoinRequests)
        .where(
          and(
            eq(groupJoinRequests.groupId as any, request.groupId as any),
            eq(groupJoinRequests.applicantUserId as any, request.applicantUserId as any),
          ),
        )
        .get()

      if (existing) {
        // 如果存在，更新
        await this.db
          .update(groupJoinRequests)
          .set({
            status: request.status,
            handledBy: request.handledBy,
            handledAt: request.handledAt,
            version: request.version,
            updatedAt: request.updatedAt,
          })
          // @ts-expect-error - existing.id is guaranteed to exist if existing is not null
          .where(eq(groupJoinRequests.id, existing.id as number))
          .run()
      }
      else {
        // 如果不存在，插入
        await this.db
          .insert(groupJoinRequests)
          .values(request)
          .run()
      }
    }
  }

  // 按版本范围获取入群申请（用于数据同步）
  static async getGroupJoinRequestsByVerRange(header: any, params: any): Promise<{ list: IDBGroupJoinRequest[] }> {
    const userId = String(header.userId)
    const { startVersion, endVersion } = params

    // 获取用户管理的群组（群主或管理员）
    const userMemberships = await this.db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.userId as any, userId as any),
        eq(groupMembers.status as any, 1),
      ))
      .all()

    const managedGroups = (userMemberships as any[]).filter(m => m.role === 1 || m.role === 2) // 1群主 2管理员

    if (managedGroups.length === 0) {
      return { list: [] }
    }

    const groupIds = managedGroups.map((g: any) => g.groupId)
    const requests = await this.db.select().from(groupJoinRequests).where(and(inArray(groupJoinRequests.groupId as any, groupIds as any), gte(groupJoinRequests.version as any, startVersion as any), lte(groupJoinRequests.version as any, endVersion as any))).orderBy(groupJoinRequests.version, 'asc').all()

    return { list: requests }
  }

  // 获取所有群组申请列表（分页）
  static async getAllGroupJoinRequests(page: number = 1, limit: number = 20): Promise<IGroupJoinRequestListRes> {
    // 计算分页
    const offset = (page - 1) * limit

    // 获取总数
    const totalResult = await this.db
      .select({ count: groupJoinRequests.id })
      .from(groupJoinRequests)
      .all()

    const total = totalResult[0]?.count || 0

    // 获取分页数据
    const requests = await this.db
      .select()
      .from(groupJoinRequests)
      .orderBy(groupJoinRequests.createdAt, 'desc')
      .limit(limit)
      .offset(offset)
      .all()

    // 获取所有申请者ID
    const applicantIds = requests.map((r: IDBGroupJoinRequest) => r.applicantUserId as string).filter((id: string) => id)

    // 批量获取申请者用户信息
    const userInfos = await UserService.getUsersBasicInfo(applicantIds)
    const userInfoMap = new Map(userInfos.map(u => [u.userId, u]))

    // 转换为API响应格式
    const list: IGroupJoinRequestListRes['list'] = []

    for (const request of requests) {
      const userInfo = userInfoMap.get(request.applicantUserId as string)

      list.push({
        requestId: request.id as number,
        groupId: request.groupId as string,
        applicantId: request.applicantUserID as string,
        applicantName: userInfo?.nickName || '',
        applicantAvatar: userInfo?.avatar || '',
        message: request.message || '',
        status: request.status || 0,
        createAt: request.createdAt || 0,
        version: request.version || 0,
      })
    }

    return { list, count: total }
  }

  // 获取用户管理的群组申请列表（分页）
  static async getUserManagedGroupJoinRequests(userId: string, page: number = 1, limit: number = 20): Promise<IGroupJoinRequestListRes> {
    // 获取用户管理的群组（群主或管理员）
    const userMemberships = await this.db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.userId as any, userId as any),
        eq(groupMembers.status as any, 1),
      ))
      .all()

    const managedGroups = (userMemberships as any[]).filter(m => m.role === 1 || m.role === 2) // 1群主 2管理员

    if (managedGroups.length === 0) {
      return { list: [], count: 0 }
    }

    const groupIds = managedGroups.map((g: any) => g.groupId)

    // 计算分页
    const offset = (page - 1) * limit

    // 获取总数
    const totalResult = await this.db
      .select({ count: groupJoinRequests.id })
      .from(groupJoinRequests)
      .where(inArray(groupJoinRequests.groupId as any, groupIds as any))
      .all()

    const total = totalResult[0]?.count || 0

    // 获取分页数据
    const requests = await this.db
      .select()
      .from(groupJoinRequests)
      .where(inArray(groupJoinRequests.groupId as any, groupIds as any))
      .orderBy(groupJoinRequests.createdAt, 'desc')
      .limit(limit)
      .offset(offset)
      .all()

    // 获取所有申请者ID
    const applicantIds = requests.map((r: IDBGroupJoinRequest) => r.applicantUserId as string).filter((id: string) => id)

    // 批量获取申请者用户信息
    const userInfos = await UserService.getUsersBasicInfo(applicantIds)
    const userInfoMap = new Map(userInfos.map(u => [u.userId, u]))

    // 转换为API响应格式
    const list: IGroupJoinRequestListRes['list'] = []

    for (const request of requests) {
      const userInfo = userInfoMap.get(request.applicantUserId as string)

      list.push({
        requestId: request.id as number,
        groupId: request.groupId as string,
        applicantId: request.applicantUserId as string,
        applicantName: userInfo?.nickName || '',
        applicantAvatar: userInfo?.avatar || '',
        message: request.message || '',
        status: request.status || 0,
        createAt: request.createdAt || 0,
        version: request.version || 0,
      })
    }

    return { list, count: total }
  }

  // 删除指定群组的所有入群申请
  static async deleteGroupRequests(groupId: string): Promise<any> {
    return await this.db.delete(groupJoinRequests).where(eq(groupJoinRequests.groupId as any, groupId as any)).run()
  }
}
