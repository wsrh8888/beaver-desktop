import type { IDBGroup } from 'commonModule/type/database/db/group'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 群组表 (与服务器端 group_models.GroupModel 保持一致)
export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull().unique(), // 对应服务器端的 GroupID
  type: integer('type').default(1),
  title: text('title').notNull(),
  avatar: text('avatar').default('a9de5548bef8c10b92428fff61275c72.png'), // 对应服务器端的 Avatar
  creatorId: text('creator_id').notNull(),
  notice: text('notice'),
  joinType: integer('join_type').default(0),
  status: integer('status').default(1),
  version: integer('version').default(0), // 对应服务器端的 Version (int64 default 0)
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBGroup
