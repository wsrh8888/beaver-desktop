import type { IDBEmoji } from 'commonModule/type/database/emoji'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 表情表
export const emoji = sqliteTable('emoji', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  emojiId: text('emoji_id').notNull().unique(),
  fileKey: text('file_key').notNull(),
  title: text('title').notNull(),
  status: integer('status').default(1), // 状态：1=正常 2=审核中 3=违规禁用
  version: integer('version').default(0), // 版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBEmoji
