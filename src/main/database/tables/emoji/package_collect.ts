import type { IDBEmojiPackageCollect } from 'commonModule/type/database/emoji'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 用户收藏的表情包表
export const emojiPackageCollect = sqliteTable('emoji_package_collect', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  userId: text('user_id').notNull(),
  packageId: text('package_id').notNull(), // 表情包UUID
  isDeleted: integer('is_deleted').default(0), // 是否已删除（软删除）：0=未删除 1=已删除
  version: integer('version').default(0), // 版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBEmojiPackageCollect
