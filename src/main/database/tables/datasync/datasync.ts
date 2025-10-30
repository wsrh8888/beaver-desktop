import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 同步游标表 - 用于记录客户端与服务器的同步状态
export const datasync = sqliteTable('datasync', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  deviceId: text('device_id').notNull(),
  dataType: text('data_type').notNull(), // users/friends/groups/chat_messages/chat_conversation_metas/chat_user_conversations
  conversationId: text('conversation_id'), // 会话ID（仅聊天消息使用）
  lastSeq: integer('last_seq').default(0), // 最后同步的序列号（消息用）或版本号（基础数据用）
  syncStatus: text('sync_status').default('pending'), // pending/syncing/completed/failed
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
})
