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

import type { IDBChatSyncStatus } from 'commonModule/type/database/db/chat'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 聊天同步状态表 (ChatSyncStatus)
export const chatSyncStatus = sqliteTable('chat_sync_status', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: text('conversation_id').notNull(), // 会话ID
  module: text('module').notNull(), // 同步模块: 'message' | 'conversation' | 'user_conversation'
  seq: integer('seq').default(0), // 消息同步进度（仅message模块使用）
  version: integer('version').default(0), // 版本号（conversation和user_conversation模块使用）
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  uniqueConversationModule: uniqueIndex('unique_conversation_module').on(table.conversationId, table.module),
})) as unknown as IDBChatSyncStatus
