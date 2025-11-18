import type { IDBUserSyncStatus } from 'commonModule/type/database/user'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 用户同步状态表（客户端本地维护）
export const userSyncStatus = sqliteTable('user_sync_status', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(), // 用户ID
  userVersion: integer('user_version').default(0), // 用户资料版本号
  lastSyncTime: integer('last_sync_time').default(0), // 最后同步时间戳
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBUserSyncStatus
