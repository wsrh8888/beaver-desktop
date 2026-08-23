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

import type { IDBGroupJoinRequest } from 'commonModule/type/database/db/group'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 入群申请表 (与服务器端 group_models.GroupJoinRequestModel 保持一致)
export const groupJoinRequests = sqliteTable('group_join_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull(),
  applicantUserId: text('applicant_user_id').notNull(),
  message: text('message'),
  status: integer('status').default(0), // 0待审 1同意 2拒绝
  handledBy: text('handled_by'), // 对应服务器端的 HandledBy
  handledAt: integer('handled_at'), // 处理时间，对应服务器端的 HandledAt (*time.Time)
  version: integer('version').default(0), // 对应服务器端的 Version (int64 default 0)
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBGroupJoinRequest
