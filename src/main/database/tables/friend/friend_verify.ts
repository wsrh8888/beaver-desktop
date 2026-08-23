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

import type { IDBFriendVerify } from 'commonModule/type/database/db/friend'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 好友验证表
export const friendVerifies = sqliteTable('friend_verifies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  verifyId: text('verify_id').notNull().unique(),
  sendUserId: text('send_user_id').notNull(),
  revUserId: text('rev_user_id').notNull(),
  sendStatus: integer('send_status').default(0), // 发起方状态 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  revStatus: integer('rev_status').default(0), // 接收方状态 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  message: text('message'), // 附加消息
  source: text('source'), // 添加好友来源：qrcode/search/group/recommend
  version: integer('version').default(0), // 版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBFriendVerify
