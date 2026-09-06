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

import type { IDBNotificationReadCursor } from 'commonModule/type/database/db/notification'
import { and, eq, sql } from 'drizzle-orm'
import { BaseService } from '../base'
import { notificationReads } from 'mainModule/database/tables/notification/read'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('read-cursor')

import type {

  DBUpsertCursorReq,
  DBGetCursorReq,
  DBGetCursorRes,
  DBGetVersionMapReq,
  DBGetVersionMapRes,
  DBGetCursorsReq,
  DBGetCursorsRes,
} from 'commonModule/type/database/server/notification/read-cursor'

// 通知已读游标服务
class NotificationReadCursor extends BaseService {

  /**
   * @description 写入或更新游标
   */
  async upsertCursor(req: DBUpsertCursorReq): Promise<void> {
    logger.info({ text: 'upsertCursor 开始' })
    await this.db.insert(notificationReads)
      .values(req)
      .onConflictDoUpdate({
        target: [notificationReads.userId, notificationReads.category],
        set: {
          version: sql.raw(`excluded.version`),
          lastReadAt: sql.raw(`excluded.last_read_at`),
          updatedAt: sql.raw(`excluded.updated_at`),
        },
      })
      .run()
  }

  /**
   * @description 查询用户分类游标
   */
  async getCursor(req: DBGetCursorReq): Promise<DBGetCursorRes> {
    logger.info({ text: 'getCursor 开始' })
    const { userId, category } = req
    const cursor = await this.db.select()
      .from(notificationReads)
      .where(
        and(
          eq(notificationReads.userId as any, userId as any),
          eq(notificationReads.category as any, category as any),
        ),
      )
      .get()
    return cursor
  }

  /**
   * @description 获取用户游标版本映射（简化版）
   */
  async getVersionMap(req: DBGetVersionMapReq): Promise<DBGetVersionMapRes> {
    logger.info({ text: 'getVersionMap 开始' })
    // 简化逻辑：返回空Map，表示需要同步所有数据
    return { versionMap: new Map() }
  }

  /**
   * @description 获取用户多个分类的游标
   */
  async getCursors(req: DBGetCursorsReq): Promise<DBGetCursorsRes> {
    logger.info({ text: 'getCursors 开始' })
    const { userId, categories } = req
    if (!userId) return { cursors: [] }

    const query = this.db.select()
      .from(notificationReads)
      .where(eq(notificationReads.userId as any, userId as any))

    // 如果指定了分类，则添加分类过滤
    if (categories && categories.length > 0) {
      const { inArray } = await import('drizzle-orm')
      query.where(inArray(notificationReads.category as any, categories as any))
    }

    const cursors = await query.all()
    return { cursors }
  }
}

export default new NotificationReadCursor()