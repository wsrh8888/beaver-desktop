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

// 聊天同步状态服务 - 使用独立的chatSyncStatus表
import { and, eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { chatSyncStatus } from '../../tables/chat/sync-status'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('sync-status')

import type {
  DBGetSyncStatusReq,
  DBGetSyncStatusRes,
  DBGetMessageSyncStatusReq,
  DBGetMessageSyncStatusRes,
  DBGetConversationSyncStatusReq,
  DBGetConversationSyncStatusRes,
  DBGetUserConversationSyncStatusReq,
  DBGetUserConversationSyncStatusRes,
  DBGetSyncStatusesReq,
  DBGetSyncStatusesRes,
  DBGetConversationVersionsReq,
  DBGetConversationVersionsRes,
  DBGetMessageVersionsReq,
  DBGetMessageVersionsRes,
  DBGetUserConversationVersionsReq,
  DBGetUserConversationVersionsRes,
  DBGetAllSyncStatusReq,
  DBGetAllSyncStatusRes,
  DBUpsertSyncStatusReq,
  DBUpsertSyncStatusRes,
  DBUpsertMessageSyncStatusReq,
  DBUpsertMessageSyncStatusRes,
  DBUpsertConversationSyncStatusReq,
  DBUpsertConversationSyncStatusRes,
  DBUpsertUserConversationSyncStatusReq,
  DBUpsertUserConversationSyncStatusRes,
  DBBatchUpsertSyncStatusReq,
  DBBatchUpsertSyncStatusRes,
  DBDeleteSyncStatusReq,
  DBDeleteSyncStatusRes,
  DBBatchDeleteSyncStatusReq,
  DBBatchDeleteSyncStatusRes,
  DBClearAllSyncStatusReq,
  DBClearAllSyncStatusRes,
} from 'commonModule/type/database/server/chat/sync-status'

class dBServiceChatSyncStatus extends BaseService {
  /**
   * @description 获取指定模块的同步状态
   */
  async getSyncStatus(req: DBGetSyncStatusReq): Promise<DBGetSyncStatusRes> {
    logger.info({ text: 'getSyncStatus 开始' })
    const syncStatus = await this.db.select().from(chatSyncStatus).where(and(eq(chatSyncStatus.module, req.module), eq(chatSyncStatus.conversationId, req.conversationId))).get()
    return syncStatus
  }

  /**
   * @description 获取消息同步状态
   */
  async getMessageSyncStatus(req: DBGetMessageSyncStatusReq): Promise<DBGetMessageSyncStatusRes> {
    logger.info({ text: 'getMessageSyncStatus 开始' })
    return await this.getSyncStatus({ module: 'message', conversationId: req.conversationId })
  }

  /**
   * @description 获取会话同步状态
   */
  async getConversationSyncStatus(req: DBGetConversationSyncStatusReq): Promise<DBGetConversationSyncStatusRes> {
    logger.info({ text: 'getConversationSyncStatus 开始' })
    return await this.getSyncStatus({ module: 'conversation', conversationId: req.conversationId })
  }

  /**
   * @description 获取用户会话同步状态
   */
  async getUserConversationSyncStatus(req: DBGetUserConversationSyncStatusReq): Promise<DBGetUserConversationSyncStatusRes> {
    logger.info({ text: 'getUserConversationSyncStatus 开始' })
    return await this.getSyncStatus({ module: 'user_conversation', conversationId: req.conversationId })
  }

  /**
   * @description 批量获取同步状态
   */
  async getSyncStatuses(req: DBGetSyncStatusesReq): Promise<DBGetSyncStatusesRes> {
    logger.info({ text: 'getSyncStatuses 开始' })
    if (req.conversationIds.length === 0)
      return []
    const syncStatuses = await this.db.select().from(chatSyncStatus).where(and(eq(chatSyncStatus.module, req.module), inArray(chatSyncStatus.conversationId, req.conversationIds))).all()
    return syncStatuses
  }

  /**
   * @description 批量获取会话版本状态
   */
  async getConversationVersions(req: DBGetConversationVersionsReq): Promise<DBGetConversationVersionsRes> {
    logger.info({ text: 'getConversationVersions 开始' })
    const syncStatuses = await this.getSyncStatuses({ module: 'conversation', conversationIds: req.conversationIds })
    const versions = syncStatuses.map(status => ({
      conversationId: status.conversationId,
      version: status.version || 0,
    }))
    return versions
  }

  // 批量获取消息版本状态
  async getMessageVersions(req: DBGetMessageVersionsReq): Promise<DBGetMessageVersionsRes> {
    logger.info({ text: 'getMessageVersions 开始' })
    const statuses = await this.getSyncStatuses({ module: 'message', conversationIds: req.conversationIds })
    return statuses.map(status => ({
      conversationId: status.conversationId,
      seq: status.seq || 0,
    }))
  }

  // 批量获取用户会话版本状态
  async getUserConversationVersions(req: DBGetUserConversationVersionsReq): Promise<DBGetUserConversationVersionsRes> {
    logger.info({ text: 'getUserConversationVersions 开始' })
    const statuses = await this.getSyncStatuses({ module: 'user_conversation', conversationIds: req.conversationIds })
    return statuses.map(status => ({
      conversationId: status.conversationId,
      version: status.version || 0,
    }))
  }

  /**
   * @description 获取所有同步状态
   */
  async getAllSyncStatus(req: DBGetAllSyncStatusReq): Promise<DBGetAllSyncStatusRes> {
    logger.info({ text: 'getAllSyncStatus 开始' })
    return await this.db.select().from(chatSyncStatus).all()
  }

  // 更新或插入同步状态
  async upsertSyncStatus(req: DBUpsertSyncStatusReq): Promise<DBUpsertSyncStatusRes> {
    logger.info({ text: 'upsertSyncStatus 开始' })
    await this.db
      .insert(chatSyncStatus)
      .values({
        module: req.module,
        conversationId: req.conversationId,
        seq: req.module === 'message' ? req.seq || 0 : 0,
        version: req.module !== 'message' ? req.version || 0 : 0,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: [chatSyncStatus.conversationId, chatSyncStatus.module],
        set: {
          seq: req.module === 'message' ? req.seq || 0 : undefined,
          version: req.module !== 'message' ? req.version || 0 : undefined,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
    return { success: true }
  }

  // 更新消息同步状态
  async upsertMessageSyncStatus(req: DBUpsertMessageSyncStatusReq): Promise<DBUpsertMessageSyncStatusRes> {
    logger.info({ text: 'upsertMessageSyncStatus 开始' })
    return this.upsertSyncStatus({ module: 'message', conversationId: req.conversationId, seq: req.seq })
  }

  // 更新会话同步状态
  async upsertConversationSyncStatus(req: DBUpsertConversationSyncStatusReq): Promise<DBUpsertConversationSyncStatusRes> {
    logger.info({ text: 'upsertConversationSyncStatus 开始' })
    return this.upsertSyncStatus({ module: 'conversation', conversationId: req.conversationId, version: req.version })
  }

  // 更新用户会话同步状态
   async upsertUserConversationSyncStatus(req: DBUpsertUserConversationSyncStatusReq): Promise<DBUpsertUserConversationSyncStatusRes> {
    logger.info({ text: 'upsertUserConversationSyncStatus 开始' })
    return this.upsertSyncStatus({ module: 'user_conversation', conversationId: req.conversationId, version: req.version })
  }

  // 批量更新同步状态
   async batchUpsertSyncStatus(req: DBBatchUpsertSyncStatusReq): Promise<DBBatchUpsertSyncStatusRes> {
    logger.info({ text: 'batchUpsertSyncStatus 开始' })
    for (const status of req.statuses) {
      await this.upsertSyncStatus({
        module: status.module,
        conversationId: status.conversationId,
        seq: status.seq || 0,
        version: status.version || 0,
      })
    }
    return { success: true }
  }

  // 删除同步状态
   async deleteSyncStatus(req: DBDeleteSyncStatusReq): Promise<DBDeleteSyncStatusRes> {
    logger.info({ text: 'deleteSyncStatus 开始' })
    await this.db.delete(chatSyncStatus)
      .where(and(eq(chatSyncStatus.module, req.module), eq(chatSyncStatus.conversationId, req.conversationId)))
      .run()
    return { success: true }
  }

  // 批量删除同步状态
   async batchDeleteSyncStatus(req: DBBatchDeleteSyncStatusReq): Promise<DBBatchDeleteSyncStatusRes> {
    logger.info({ text: 'batchDeleteSyncStatus 开始' })
    if (req.conversationIds.length === 0)
      return { success: true }
    await this.db.delete(chatSyncStatus)
      .where(and(eq(chatSyncStatus.module, req.module), inArray(chatSyncStatus.conversationId, req.conversationIds)))
      .all()
    return { success: true }
  }

  /**
   * @description 获取需要同步的会话列表（基于消息序列号）
   */
  async getConversationsNeedMessageSync(req: DBGetConversationsNeedMessageSyncReq): Promise<DBGetConversationsNeedMessageSyncRes> {
    logger.info({ text: 'getConversationsNeedMessageSync 开始' })
    const { serverSeqs } = req
    const localStatuses = await this.getSyncStatuses({ module: 'message', conversationIds: Object.keys(serverSeqs) })
    const statusMap = new Map(localStatuses.map(s => [s.conversationId, s]))

    const needSync: string[] = []

    for (const [conversationId, serverSeq] of Object.entries(serverSeqs)) {
      const localStatus = statusMap.get(conversationId)
      const localSeq = localStatus?.seq || 0

      if (localSeq < serverSeq) {
        needSync.push(conversationId)
      }
    }

    return needSync
  }

  // 清空所有同步状态（用于重置）
   async clearAllSyncStatus(req: DBClearAllSyncStatusReq): Promise<DBClearAllSyncStatusRes> {
    logger.info({ text: 'clearAllSyncStatus 开始' })
    await this.db.delete(chatSyncStatus).run()
    return { success: true }
  }
}

// 导出聊天同步状态服务实例
export default new dBServiceChatSyncStatus()
