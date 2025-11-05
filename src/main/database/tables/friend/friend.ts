import type { IDBFriend } from 'commonModule/type/database/friend'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 好友表
export const friends = sqliteTable('friends', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  sendUserId: text('send_user_id').notNull(),
  revUserId: text('rev_user_id').notNull(),
  sendUserNotice: text('send_user_notice'),
  revUserNotice: text('rev_user_notice'),
  source: text('source'),
  isDeleted: integer('is_deleted').default(0),
  version: integer('version').default(0), // 版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBFriend
