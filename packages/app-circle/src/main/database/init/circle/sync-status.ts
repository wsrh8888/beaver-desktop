/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { Logger } from '@beaver-im/beaver/main'

const logger = new Logger('DBInit-circle-sync-status')

export const initCircleSyncStatusTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS circle_sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL,
      UNIQUE(module)
    )
  `)

  try {
    sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS unique_circle_sync_module ON circle_sync_status(module)`)
  }
  catch (error: any) {
    logger.warn({
      text: '索引创建失败，可能已存在',
      data: { table: 'circle_sync_status', index: 'unique_circle_sync_module', error: error?.message },
    })
  }
}
