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
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 通知事件主表
export const notificationEvents = sqliteTable('notification_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: text('event_id').notNull().unique(), // 全局事件ID
  eventType: text('event_type').notNull(), // 事件类型
  category: text('category').notNull(), // 分类：social/group/moment等
  version: integer('version').default(0), // 全局递增版本
  fromUserId: text('from_user_id'), // 触发方
  targetId: text('target_id'), // 目标对象ID
  targetType: text('target_type').notNull(), // 目标类型：moment/group/user等
  payload: text('payload'), // JSON字符串
  priority: integer('priority').default(5), // 优先级（1最高）
  status: integer('status').default(1), // 1有效 2撤回 3失效
  dedupHash: text('dedup_hash'), // 去重哈希
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBNotificationEvent
