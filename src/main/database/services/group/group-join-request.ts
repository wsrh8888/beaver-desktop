import { and, eq, gte, inArray, lte, or, sql } from 'drizzle-orm'
import { BaseService } from '../base'
import { groupJoinRequests } from 'mainModule/database/tables/group/join-requests'
import type {
  DBCreateGroupJoinRequestReq,
  DBBatchCreateGroupJoinRequestsReq,
  DBGetJoinRequestsByGroupIdsSimpleReq,
  DBGetJoinRequestsByGroupIdsSimpleRes,
  DBGetJoinRequestsByApplicantIdReq,
  DBGetJoinRequestsByApplicantIdRes,
  DBGetJoinRequestsCountByApplicantIdReq,
  DBGetJoinRequestsCountByGroupIdsReq,
} from 'commonModule/type/database/server/group/group-join-request'

// 入群申请服务
class GroupJoinRequest extends BaseService {

  /**
   * @description 创建或更新入群申请（upsert操作）
   */
  async upsert(req: DBCreateGroupJoinRequestReq): Promise<void> {
    await this.db.insert(groupJoinRequests)
      .values(req)
      .onConflictDoUpdate({
        target: groupJoinRequests.id,
        set: {
          status: req.status,
          handledBy: req.handledBy,
          handledAt: req.handledAt,
          version: req.version,
        },
      })
      .run()
  }

  /**
   * @description 批量创建入群申请（支持插入或更新）
   */
  async batchCreate(req: DBBatchCreateGroupJoinRequestsReq): Promise<void> {
    if (req.requests.length === 0)
      return

    for (const request of req.requests) {
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


  /**
   * @description 根据申请者ID获取群组申请记录
   */
  async getJoinRequestsByApplicantId(req: DBGetJoinRequestsByApplicantIdReq): Promise<DBGetJoinRequestsByApplicantIdRes> {
    const { applicantUserId, options } = req
    const { page = 1, limit = 20 } = options || {}
    const offset = (page - 1) * limit

    return await this.db
      .select()
      .from(groupJoinRequests)
      .where(eq(groupJoinRequests.applicantUserId as any, applicantUserId as any))
      .orderBy(groupJoinRequests.createdAt, 'desc')
      .limit(limit)
      .offset(offset)
      .all()
  }

  /**
   * @description 根据群组ID列表获取群组申请记录（简化版）
   */
  async getJoinRequestsByGroupIdsSimple(req: DBGetJoinRequestsByGroupIdsSimpleReq): Promise<DBGetJoinRequestsByGroupIdsSimpleRes> {
    const { groupIds, options } = req
    const { page = 1, limit = 20 } = options || {}
    const offset = (page - 1) * limit

    if (groupIds.length === 0) {
      return []
    }

    return await this.db
      .select()
      .from(groupJoinRequests)
      .where(inArray(groupJoinRequests.groupId as any, groupIds as any))
      .orderBy(groupJoinRequests.createdAt, 'desc')
      .limit(limit)
      .offset(offset)
      .all()
  }

  /**
   * @description 根据申请者ID获取群组申请数量
   */
  async getJoinRequestsCountByApplicantId(req: DBGetJoinRequestsCountByApplicantIdReq): Promise<number> {
    const result = await this.db
      .select({ count: sql`COUNT(*)` })
      .from(groupJoinRequests)
      .where(eq(groupJoinRequests.applicantUserId as any, req.applicantUserId as any))
      .all()

    return result[0]?.count || 0
  }

  /**
   * @description 根据群组ID列表获取群组申请数量
   */
  async getJoinRequestsCountByGroupIds(req: DBGetJoinRequestsCountByGroupIdsReq): Promise<number> {
    if (req.groupIds.length === 0) {
      return 0
    }

    const result = await this.db
      .select({ count: sql`COUNT(*)` })
      .from(groupJoinRequests)
      .where(inArray(groupJoinRequests.groupId as any, req.groupIds as any))
      .all()

    return result[0]?.count || 0
  }

}

export default new GroupJoinRequest()