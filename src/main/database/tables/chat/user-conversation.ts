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

import type { IDBChatUserConversation } from 'commonModule/type/database/db/chat'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 用户会话表 (ChatUserConversation)
export const chatUserConversations = sqliteTable('chat_user_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  conversationId: text('conversation_id').notNull(),
  // lastMessage 已移至 ChatConversationMeta 表，避免重复存储
  isHidden: integer('is_hidden').default(0), // 是否在用户会话列表隐藏
  isPinned: integer('is_pinned').default(0), // 置顶
  isMuted: integer('is_muted').default(0), // 免打扰
  userReadSeq: integer('user_read_seq').default(0), // 用户已读游标
  version: integer('version').default(0), // 配置版本（基于ConversationID递增，从0开始）
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBChatUserConversation
