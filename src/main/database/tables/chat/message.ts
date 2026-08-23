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

import type { IDBChatMessage } from 'commonModule/type/database/db/chat'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 聊天消息表 (ChatMessage)
export const chats = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  messageId: text('message_id').notNull().unique(), // 唯一消息ID
  conversationId: text('conversation_id').notNull(), // 所属会话ID
  conversationType: integer('conversation_type').notNull(), // 会话类型（1=私聊 2=群聊）
  seq: integer('seq').default(0), // 消息在会话内的序列号（基于ConversationID递增，从1开始）
  sendUserId: text('send_user_id'), // 发送者用户ID（系统消息可为null）
  msgType: integer('msg_type').notNull(), // 消息类型 1:文本 2:图片 3:视频 4:文件 5:语音 6:表情
  targetMessageId: text('target_message_id'), // 针对的原消息ID（撤回/删除/编辑事件）
  msgPreview: text('msg_preview'), // 消息预览文本
  msg: text('msg'), // 消息内容（JSON）
  sendStatus: integer('send_status').default(1), // 发送状态 (0=发送中 1=已发送 2=发送失败) - 仅客户端使用
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBChatMessage
