import type { IDBChatSyncStatus } from 'commonModule/type/database/chat'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 聊天同步状态表 (ChatSyncStatus)
export const chatSyncStatus = sqliteTable('chat_sync_status', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: text('conversation_id').notNull(), // 会话ID
  module: text('module').notNull(), // 同步模块: 'message' | 'conversation' | 'user_conversation'
  seq: integer('seq').default(0), // 消息同步进度（仅message模块使用）
  version: integer('version').default(0), // 版本号（conversation和user_conversation模块使用）
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  uniqueConversationModule: uniqueIndex('unique_conversation_module').on(table.conversationId, table.module),
})) as unknown as IDBChatSyncStatus
