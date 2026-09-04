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

// 初始化群成员表
import Logger from 'mainModule/utils/logger'

const logger = new Logger('DBInit-group-members')

export const initGroupMembersTable = (sqlite: any) => {
  // 创建群成员表 (与服务器端 group_models.GroupMemberModel 保持一致)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role INTEGER DEFAULT 3,
      status INTEGER DEFAULT 1,
      join_time INTEGER DEFAULT (strftime('%s', 'now')),
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  const fields = [
    'join_time INTEGER DEFAULT (strftime(\'%s\', \'now\'))',
    'version INTEGER DEFAULT 0',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE group_members ADD COLUMN ${field}`)
    }
    catch (error: any) {
      // 忽略已存在的列错误
      if (!error.message?.includes('duplicate column name')) {
        logger.warn({ text: '表字段添加失败', data: { table: 'group_members', field: field.split(' ')[0], error: error.message } })
      }
    }
  })
}
