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

// 初始化通知事件表
export const initNotificationEventsTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notification_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      category TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      from_user_id TEXT,
      target_id TEXT,
      target_type TEXT NOT NULL,
      payload TEXT,
      priority INTEGER DEFAULT 5,
      status INTEGER DEFAULT 1,
      dedup_hash TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  const columns = [
    'version INTEGER DEFAULT 0',
    'from_user_id TEXT',
    'target_id TEXT',
    'payload TEXT',
    'priority INTEGER DEFAULT 5',
    'status INTEGER DEFAULT 1',
    'dedup_hash TEXT',
  ]

  columns.forEach((column) => {
    try {
      sqlite.run(`ALTER TABLE notification_events ADD COLUMN ${column}`)
    }
    catch (error: any) {
      if (!error.message?.includes('duplicate column name'))
        console.log(`notification_events表的${column.split(' ')[0]}字段可能已存在`)
    }
  })
}
