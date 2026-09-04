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

// 初始化通知已读游标表
import Logger from 'mainModule/utils/logger'

const logger = new Logger('DBInit-notification-reads')

export const initNotificationReadsTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notification_reads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      last_read_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, category)
    )
  `)

  const columns = [
    'version INTEGER DEFAULT 0',
    'last_read_at INTEGER',
  ]

  columns.forEach((column) => {
    try {
      sqlite.run(`ALTER TABLE notification_reads ADD COLUMN ${column}`)
    }
    catch (error: any) {
      if (!error.message?.includes('duplicate column name'))
        logger.warn({ text: '表字段添加失败', data: { table: 'notification_reads', field: column.split(' ')[0], error: error.message } })
    }
  })
}
