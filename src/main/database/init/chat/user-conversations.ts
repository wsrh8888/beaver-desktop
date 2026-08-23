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

// 初始化用户会话表
export const initChatUserConversationsTable = (sqlite: any) => {
  // 创建表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_user_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      conversation_id TEXT NOT NULL,
      is_hidden INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      is_muted INTEGER DEFAULT 0,
      user_read_seq INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, conversation_id)
    )
  `)

  // 简单字段补齐
  const fields = [
    'is_hidden INTEGER DEFAULT 0',
    'is_muted INTEGER DEFAULT 0',
    'user_read_seq INTEGER DEFAULT 0',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE chat_user_conversations ADD COLUMN ${field}`)
    }
    catch (error: any) {
      // 忽略已存在的列错误
      if (!error.message?.includes('duplicate column name')) {
        console.log(`chat_user_conversations表的${field.split(' ')[0]}字段可能已存在`)
      }
    }
  })
}
