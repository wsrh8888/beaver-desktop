import type { IDBEmojiPackageEmoji } from 'commonModule/type/database/emoji'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 表情包与表情的多对多关联表
export const emojiPackageEmoji = sqliteTable('emoji_package_emoji', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  packageId: text('package_id').notNull(), // 表情包UUID
  emojiId: text('emoji_id').notNull(), // 表情UUID
  sortOrder: integer('sort_order').default(0), // 在表情包中的排序
  version: integer('version').default(0), // 版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBEmojiPackageEmoji
