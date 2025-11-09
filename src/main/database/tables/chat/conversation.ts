import type { IDBChatConversationMeta } from 'commonModule/type/database/chat'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 聊天会话表 (ChatConversationMeta) - 全局表
export const chatConversations = sqliteTable('chat_conversation_metas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: text('conversation_id').notNull().unique(), // 会话UUID，全局唯一
  type: integer('type').notNull(), // 1=私聊 2=群聊 3=系统会话
  maxSeq: integer('max_seq').default(0), // 会话最新消息序号
  lastMessage: text('last_message'), // 会话最后一条消息预览（全局唯一）
  version: integer('version').default(0), // 会话版本号（基于ConversationID递增，从0开始）
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBChatConversationMeta
