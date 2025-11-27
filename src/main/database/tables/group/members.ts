import type { IDBGroupMember } from 'commonModule/type/database/group'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 群成员表 (与服务器端 group_models.GroupMemberModel 保持一致)
export const groupMembers = sqliteTable('group_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull(),
  userId: text('user_id').notNull(),
  role: integer('role').default(3), // 1群主 2管理员 3普通成员
  status: integer('status').default(1), // 1正常 2退出 3被踢
  joinTime: integer('join_time').default(sql`(strftime('%s', 'now'))`), // 加入时间，对应服务器端的 JoinTime
  version: integer('version').default(0), // 群组成员列表版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  uniqueGroupUser: uniqueIndex('unique_group_user').on(table.groupId, table.userId),
})) as unknown as IDBGroupMember
