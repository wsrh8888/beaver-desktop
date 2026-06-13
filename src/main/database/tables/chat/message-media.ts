import type { IDBChatMessageMedia } from 'commonModule/type/database/db/chat'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const chatMessageMedias = sqliteTable('chat_message_medias', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  messageId: text('message_id').notNull(),
  version: integer('version').default(0),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBChatMessageMedia
