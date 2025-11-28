import type { IDBEmojiPackage } from 'commonModule/type/database/emoji'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 表情包表
export const emojiPackage = sqliteTable('emoji_package', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  title: text('title').notNull(),
  coverFile: text('cover_file'),
  userId: text('user_id').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 类型：official-官方，user-用户自定义
  status: integer('status').default(1), // 状态：1=正常 2=审核中 3=违规禁用
  version: integer('version').default(0), // 版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBEmojiPackage
