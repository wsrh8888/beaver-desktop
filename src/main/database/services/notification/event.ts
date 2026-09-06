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

import type { IDBNotificationEvent } from 'commonModule/type/database/db/notification'
import { gt, inArray, sql } from 'drizzle-orm'
import { BaseService } from '../base'
import { notificationEvents } from 'mainModule/database/tables/notification/event'
import type {
import Logger from 'mainModule/utils/logger';
const logger = new Logger('event')

  DBBatchCreateNotificationEventsReq,
  DBGetEventsAfterVersionReq,
  DBGetEventsAfterVersionRes,
  DBGetVersionMapByIdsReq,
  DBGetVersionMapByIdsRes,
  DBGetNotificationEventsReq,
  DBGetNotificationEventsRes,
} from 'commonModule/type/database/server/notification/event'

// 通知事件表服务
class NotificationEvent extends BaseService {

  /**
   * @description 批量创建通知事件
   */
  async batchCreate(req: DBBatchCreateNotificationEventsReq): Promise<void> {
    logger.info({ text: 'batchCreate 开始' })
    if (!req.events.length)
      return

    await this.db.insert(notificationEvents)
      .values(req.events)
      .onConflictDoUpdate({
        target: notificationEvents.eventId,
        set: {
          eventType: sql.raw(`excluded.event_type`),
          category: sql.raw(`excluded.category`),
          version: sql.raw(`excluded.version`),
          fromUserId: sql.raw(`excluded.from_user_id`),
          targetId: sql.raw(`excluded.target_id`),
          targetType: sql.raw(`excluded.target_type`),
          payload: sql.raw(`excluded.payload`),
          priority: sql.raw(`excluded.priority`),
          status: sql.raw(`excluded.status`),
          dedupHash: sql.raw(`excluded.dedup_hash`),
          updatedAt: sql.raw(`excluded.updated_at`),
        },
      })
      .run()
  }

  /**
   * @description 按版本增量拉取事件
   */
  async getEventsAfterVersion(req: DBGetEventsAfterVersionReq): Promise<DBGetEventsAfterVersionRes> {
    logger.info({ text: 'getEventsAfterVersion 开始' })
    const limit = req.limit || 100
    const events = await this.db.select()
      .from(notificationEvents)
      .where(gt(notificationEvents.version as any, req.version as any))
      .orderBy(notificationEvents.version)
      .limit(limit)
      .all()
    return { events }
  }

  /**
   * @description 获取指定事件ID的本地版本映射
   */
  async getVersionMapByIds(req: DBGetVersionMapByIdsReq): Promise<DBGetVersionMapByIdsRes> {
    logger.info({ text: 'getVersionMapByIds 开始' })
    if (!req.eventIds.length)
      return { versionMap: new Map() }

    const rows = await this.db.select({
      eventId: notificationEvents.eventId,
      version: notificationEvents.version,
    })
      .from(notificationEvents)
      .where(inArray(notificationEvents.eventId as any, req.eventIds as any))
      .all()

    const versionMap = new Map<string, number>()
    rows.forEach((row) => {
      versionMap.set(row.eventId, row.version || 0)
    })
    return { versionMap }
  }

  /**
   * @description 根据事件ID列表获取事件明细
   */
  async getByIds(req: DBGetNotificationEventsReq): Promise<DBGetNotificationEventsRes> {
    logger.info({ text: 'getByIds 开始' })
    if (!req.eventIds.length)
      return []

    const events = await this.db.select()
      .from(notificationEvents)
      .where(inArray(notificationEvents.eventId as any, req.eventIds as any))
      .all()
    return events
  }
}

export default new NotificationEvent()