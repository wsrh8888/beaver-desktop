import type { IDBMedia } from 'commonModule/type/database/db/media'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

// 媒体表
export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileKey: text('file_key').notNull(), // 文件名（MD5 + 后缀）
  path: text('path').notNull(), // 文件相对路径或绝对路径
  type: text('type').notNull(), // 媒体类型：image/video/voice/file/avatar/emoticon/temp/thumbnail
  size: integer('size'), // 文件大小（字节）
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
  isDeleted: integer('is_deleted').default(0),
}, table => ({
  fileKeyIdx: unique().on(table.fileKey),
})) as unknown as IDBMedia
