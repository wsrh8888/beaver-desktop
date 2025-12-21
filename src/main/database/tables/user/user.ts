import type { IDBUser } from 'commonModule/type/database/db/user'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 用户表
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  nickName: text('nick_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  avatar: text('avatar'),
  abstract: text('abstract'), // 个性签名
  gender: integer('gender').default(3), // 性别：1男 2女 3未知
  status: integer('status').default(1),
  version: integer('version').default(0), // 版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBUser
