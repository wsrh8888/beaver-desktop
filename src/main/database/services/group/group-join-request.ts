/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import { and, eq, gte, inArray, lte, or, sql } from 'drizzle-orm'
import { BaseService } from '../base'
import { groupJoinRequests } from 'mainModule/database/tables/group/join-requests'
import type {
import Logger from 'mainModule/utils/logger';
const logger = new Logger('group-join-request')

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
    logger.info({ text: 'upsert 开始' })
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
    logger.info({ text: 'batchCreate 开始' })
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
    logger.info({ text: 'getJoinRequestsByApplicantId 开始' })
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
    logger.info({ text: 'getJoinRequestsByGroupIdsSimple 开始' })
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
    logger.info({ text: 'getJoinRequestsCountByApplicantId 开始' })
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
    logger.info({ text: 'getJoinRequestsCountByGroupIds 开始' })
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