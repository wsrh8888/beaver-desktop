import type { IDBNotificationInbox } from 'commonModule/type/database/notification'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 通知收件箱：用户维度存储事件状态
export const notificationInboxes = sqliteTable('notification_inboxes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  eventId: text('event_id').notNull(),
  eventType: text('event_type').notNull(),
  category: text('category').notNull(),
  version: integer('version').default(0), // 按用户递增版本
  isRead: integer('is_read').default(0),
  readAt: integer('read_at'),
  status: integer('status').default(1), // 1=正常 2=隐藏/撤回 3=过期
  isDeleted: integer('is_deleted').default(0), // 用户是否删除该通知
  silent: integer('silent').default(0), // 是否静默
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  inboxUserEventUniq: uniqueIndex('uniq_inbox_user_event').on(table.userId, table.eventId),
})) as unknown as IDBNotificationInbox
