import type { IDBFriendVerify } from 'commonModule/type/database/friend'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 好友验证表
export const friendVerifies = sqliteTable('friend_verifies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  sendUserId: text('send_user_id').notNull(),
  revUserId: text('rev_user_id').notNull(),
  sendStatus: integer('send_status').default(0), // 发起方状态 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  revStatus: integer('rev_status').default(0), // 接收方状态 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  message: text('message'), // 附加消息
  source: text('source'), // 添加好友来源：qrcode/search/group/recommend
  version: integer('version').default(0), // 版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBFriendVerify
