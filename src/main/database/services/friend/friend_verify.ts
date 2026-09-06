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

import { and, eq, gte, inArray, lte, or } from 'drizzle-orm'
import { BaseService } from '../base'
import { friendVerifies } from '../../tables/friend/friend_verify'
import { users } from '../../tables/user/user'
import type {
import Logger from 'mainModule/utils/logger';
const logger = new Logger('friend_verify')

  DBCreateFriendVerifyReq,
  DBCreateFriendVerifyRes,
  DBGetFriendVerifiesByIdsReq,
  DBGetFriendVerifiesByIdsRes,
  DBBatchCreateFriendVerifiesReq,
  DBBatchCreateFriendVerifiesRes,
  DBGetValidListReq,
  DBGetValidListRes,
  DBGetValidByVerRangeReq,
  DBGetValidByVerRangeRes,
  DBGetValidByIdsReq,
  DBGetValidByIdsRes,
} from 'commonModule/type/database/server/friend/friend_verify'

// 好友验证服务
class FriendVerify extends BaseService {

  /**
   * @description 根据验证记录ID批量查询好友验证记录
   */
  async getFriendVerifiesByIds(req: DBGetFriendVerifiesByIdsReq): Promise<DBGetFriendVerifiesByIdsRes> {
    logger.info({ text: 'getFriendVerifiesByIds 开始' })
    const { verifyIds } = req
    if (verifyIds.length === 0) {
      return { verifyMap: new Map() }
    }

    const existingVerifies = await this.db
      .select()
      .from(friendVerifies)
      .where(inArray(friendVerifies.verifyId, verifyIds as any))
      .all()

    const verifyMap = new Map<string, any>()
    existingVerifies.forEach((verify) => {
      verifyMap.set(verify.verifyId, verify)
    })

    return verifyMap
  }

  /**
   * @description 批量创建好友验证记录（支持插入或更新）
   */
  async batchCreate(req: DBBatchCreateFriendVerifiesReq): Promise<DBBatchCreateFriendVerifiesRes> {
    logger.info({ text: 'batchCreate 开始' })
    const { verifies } = req
    if (verifies.length === 0)
      return {}

    // 使用插入或更新的方式来避免唯一约束冲突
    for (const verify of verifies) {
      await this.db
        .insert(friendVerifies)
        .values(verify)
        .onConflictDoUpdate({
          target: friendVerifies.verifyId,
          set: {
            sendUserId: verify.sendUserId,
            revUserId: verify.revUserId,
            sendStatus: verify.sendStatus,
            revStatus: verify.revStatus,
            message: verify.message,
            source: verify.source,
            version: verify.version,
            updatedAt: verify.updatedAt,
          },
        })
        .run()
    }
    return {}
  }

  /**
   * @description 获取好友验证列表
   */
  async getValidList(req: DBGetValidListReq): Promise<DBGetValidListRes> {
    logger.info({ text: 'getValidList 开始' })
    const { userId, page = 1, limit = 20 } = req
    const offset = (page - 1) * limit

    // 查询发送给当前用户的验证记录或当前用户发送的验证记录
    const validRecords = await this.db
      .select()
      .from(friendVerifies)
      .where(or(
        eq(friendVerifies.revUserId, userId), // 接收者是当前用户
        eq(friendVerifies.sendUserId, userId), // 发送者是当前用户
      ))
      .limit(limit)
      .offset(offset)
      .all()

    return validRecords
  }

  /**
   * @description 根据版本范围获取验证列表
   */
  async getValidByVerRange(req: DBGetValidByVerRangeReq): Promise<DBGetValidByVerRangeRes> {
    logger.info({ text: 'getValidByVerRange 开始' })
    const { userId, startVersion = 0, endVersion = Number.MAX_SAFE_INTEGER } = req

    // 查询指定版本范围内的验证记录
    const validRecords = await this.db
      .select()
      .from(friendVerifies)
      .where(and(
        or(
          eq(friendVerifies.revUserId, userId), // 接收者是当前用户
          eq(friendVerifies.sendUserId, userId), // 发送者是当前用户
        ),
        gte(friendVerifies.version, startVersion),
        lte(friendVerifies.version, endVersion),
      ))
      .all()

    return validRecords
  }

  /**
   * @description 根据验证记录ID列表批量查询验证记录
   */
  async getValidByIds(req: DBGetValidByIdsReq): Promise<DBGetValidByIdsRes> {
    logger.info({ text: 'getValidByIds 开始' })
    const { verifyIds } = req
    if (verifyIds.length === 0) {
      return []
    }

    const validRecords = await this.db
      .select()
      .from(friendVerifies)
      .where(inArray(friendVerifies.verifyId, verifyIds as any))
      .all()

    return validRecords
  }
}

export default new FriendVerify()