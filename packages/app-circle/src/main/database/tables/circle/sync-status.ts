/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

/** 圈子模块自有同步游标 */
export const circleSyncStatus = sqliteTable('circle_sync_status', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  module: text('module').notNull(),
  version: integer('version').default(0),
  updatedAt: integer('updated_at').notNull(),
}, table => ({
  uniqueModule: uniqueIndex('unique_circle_sync_module').on(table.module),
}))
