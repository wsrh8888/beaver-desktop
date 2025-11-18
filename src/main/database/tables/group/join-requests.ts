import type { IDBGroupJoinRequest } from 'commonModule/type/database/group'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 入群申请表 (与服务器端 group_models.GroupJoinRequestModel 保持一致)
export const groupJoinRequests = sqliteTable('group_join_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull(),
  applicantUserId: text('applicant_user_id').notNull(),
  message: text('message'),
  status: integer('status').default(0), // 0待审 1同意 2拒绝
  handledBy: text('handled_by'), // 对应服务器端的 HandledBy
  handledAt: integer('handled_at'), // 处理时间，对应服务器端的 HandledAt (*time.Time)
  version: integer('version').default(0), // 对应服务器端的 Version (int64 default 0)
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBGroupJoinRequest
