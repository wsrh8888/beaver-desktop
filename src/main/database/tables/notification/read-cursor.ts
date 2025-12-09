import type { IDBNotificationReadCursor } from 'commonModule/type/database/notification'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 通知已读游标：按用户+分类记录批量已读位置
export const notificationReadCursors = sqliteTable('notification_read_cursors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  category: text('category').notNull(),
  version: integer('version').default(0), // 游标版本
  lastEventId: text('last_event_id'),
  lastReadAt: integer('last_read_at'),
  lastReadTime: integer('last_read_time'),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  cursorUserCategoryUniq: uniqueIndex('uniq_cursor_user_category').on(table.userId, table.category),
})) as unknown as IDBNotificationReadCursor
