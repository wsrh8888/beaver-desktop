import type { IDBFriendSyncStatus } from 'commonModule/type/database/friend'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 好友同步状态表
export const friendSyncStatus = sqliteTable('friend_sync_status', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  friendId: text('friend_id').notNull().unique(), // 好友ID
  version: integer('version').default(0), // 好友关系版本号
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBFriendSyncStatus
