import type { IDBCircle } from 'commonModule/type/database/db/circle'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const circles = sqliteTable('circles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  circleId: text('circle_id').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar').default(''),
  description: text('description').default(''),
  creatorId: text('creator_id').default(''),
  memberCount: integer('member_count').default(0),
  role: integer('role').default(0),
  joinType: integer('join_type').default(0),
  version: integer('version').default(0),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBCircle
