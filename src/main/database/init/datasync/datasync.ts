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

// 初始化数据同步表
import Logger from 'mainModule/utils/logger'

const logger = new Logger('DBInit-datasync')

export const initDatasyncTable = (sqlite: any) => {
  // 创建同步游标表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS datasync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 创建唯一索引（如果不存在）
  try {
    sqlite.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_module ON datasync(module)`)
  }
  catch (error: any) {
    logger.warn({ text: '索引创建失败，可能已存在', data: { table: 'datasync', index: 'unique_module', error: error?.message } })
  }
}
