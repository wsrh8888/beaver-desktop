import type { IDBNotificationEvent } from 'commonModule/type/database/notification'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 通知事件主表
export const notificationEvents = sqliteTable('notification_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: text('event_id').notNull().unique(), // 全局事件ID
  eventType: text('event_type').notNull(), // 事件类型
  category: text('category').notNull(), // 分类：social/group/moment等
  version: integer('version').default(0), // 全局递增版本
  fromUserId: text('from_user_id'), // 触发方
  targetId: text('target_id'), // 目标对象ID
  targetType: text('target_type').notNull(), // 目标类型：moment/group/user等
  payload: text('payload'), // JSON字符串
  priority: integer('priority').default(5), // 优先级（1最高）
  status: integer('status').default(1), // 1有效 2撤回 3失效
  dedupHash: text('dedup_hash'), // 去重哈希
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBNotificationEvent
