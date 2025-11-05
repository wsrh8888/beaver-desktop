import type { IDBGroup, IDBGroupJoinRequest, IDBGroupMember, IDBGroupSyncStatus } from 'commonModule/type/database/group'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 群组表
export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  type: integer('type').default(1),
  title: text('title').notNull(),
  fileName: text('file_name').default('71e4be6c-b477-4fce-8348-9cc53349ef28.png'),
  creatorId: text('creator_id').notNull(),
  notice: text('notice'),
  joinType: integer('join_type').default(0),
  status: integer('status').default(1),
  version: integer('version').default(1), // 群组版本号，每个群组独立
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBGroup

// 群成员表
export const groupMembers = sqliteTable('group_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull(),
  userId: text('user_id').notNull(),
  role: integer('role').default(3),
  status: integer('status').default(1),
  version: integer('version').default(0),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBGroupMember

// 入群申请表
export const groupJoinRequests = sqliteTable('group_join_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull(),
  applicantUserId: text('applicant_user_id').notNull(),
  message: text('message'),
  status: integer('status').default(0), // 0待审 1同意 2拒绝
  handledBy: text('handled_by'),
  handledAt: integer('handled_at'),
  version: integer('version').default(0),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBGroupJoinRequest

// 群组同步状态表（客户端本地维护）
export const groupSyncStatus = sqliteTable('group_sync_status', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull().unique(),
  groupVersion: integer('group_version').default(0), // 群资料版本
  memberVersion: integer('member_version').default(0), // 群成员版本
  requestVersion: integer('request_version').default(0), // 入群申请版本
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBGroupSyncStatus
