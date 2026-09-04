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

// 初始化聊天消息表
import Logger from 'mainModule/utils/logger'

const logger = new Logger('DBInit-chat-messages')

export const initChatMessagesTable = (sqlite: any) => {
  // 创建表 - 使用drizzle-orm的run方法
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL UNIQUE,
      conversation_id TEXT NOT NULL,
      conversation_type INTEGER NOT NULL,
      seq INTEGER DEFAULT 0,
      send_user_id TEXT,
      msg_type INTEGER NOT NULL,
      target_message_id TEXT,
      msg_preview TEXT,
      msg TEXT,
      send_status INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 简单字段补齐
  const fields = [
    'seq INTEGER DEFAULT 0',
    'target_message_id TEXT',
    'conversation_type INTEGER NOT NULL DEFAULT 1',
    'send_status INTEGER DEFAULT 1',
  ]

  fields.forEach((field) => {
    try {
      sqlite.run(`ALTER TABLE chat_messages ADD COLUMN ${field}`)
    }
    catch (error: any) {
      // 忽略已存在的列错误
      if (!error.message?.includes('duplicate column name')) {
        logger.warn({ text: '表字段添加失败', data: { table: 'chat_messages', field: field.split(' ')[0], error: error.message } })
      }
    }
  })
}
