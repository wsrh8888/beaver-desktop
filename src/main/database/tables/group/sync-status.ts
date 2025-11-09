import type { IDBGroupSyncStatus } from 'commonModule/type/database/group'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 群组同步状态表 (GroupSyncStatus)
export const groupSyncStatus = sqliteTable('group_sync_status', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull(), // 群组ID
  module: text('module').notNull(), // 同步模块: 'info' | 'members' | 'requests'
  version: integer('version').default(0), // 版本号
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  uniqueGroupModule: uniqueIndex('unique_group_module').on(table.groupId, table.module),
})) as unknown as IDBGroupSyncStatus
