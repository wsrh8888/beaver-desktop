import { sql } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
})

// 群成员表
export const groupMembers = sqliteTable('group_members', {
  id: integer('id').notNull(),
  groupId: text('group_id').notNull(),
  userId: text('user_id').notNull(),
  role: integer('role').default(3),
  status: integer('status').default(1),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  pk: primaryKey({ columns: [table.groupId, table.userId] }),
}))
