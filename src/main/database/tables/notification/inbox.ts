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

import type { IDBNotificationInbox } from 'commonModule/type/database/db/notification'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 通知收件箱：用户维度存储事件状态
export const notificationInboxes = sqliteTable('notification_inboxes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  eventId: text('event_id').notNull(),
  eventType: text('event_type').notNull(),
  category: text('category').notNull(),
  version: integer('version').default(0), // 按用户递增版本
  isRead: integer('is_read').default(0),
  readAt: integer('read_at'),
  status: integer('status').default(1), // 1=正常 2=隐藏/撤回 3=过期
  isDeleted: integer('is_deleted').default(0), // 用户是否删除该通知
  silent: integer('silent').default(0), // 是否静默
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  inboxUserEventUniq: uniqueIndex('uniq_inbox_user_event').on(table.userId, table.eventId),
})) as unknown as IDBNotificationInbox
