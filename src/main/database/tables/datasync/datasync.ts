import type { IDBDatasync } from 'commonModule/type/database/db/datasync'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 同步游标表 - 用于记录客户端与服务器的同步状态
export const datasync = sqliteTable('datasync', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  module: text('module').notNull(), // 业务模块: 'users' | 'friends' | 'groups' | 'chat_*'
  version: integer('version'), // 模块版本号或最后序列号，如果没有则为null
  updatedAt: integer('updated_at').notNull(), // 最后更新时间戳，由外部传入
}, table => ({
  uniqueModule: uniqueIndex('unique_module').on(table.module),
})) as unknown as IDBDatasync
