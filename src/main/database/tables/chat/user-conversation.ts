import type { IDBChatUserConversation } from 'commonModule/type/database/chat'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 用户会话表 (ChatUserConversation)
export const chatUserConversations = sqliteTable('chat_user_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  conversationId: text('conversation_id').notNull(),
  // lastMessage 已移至 ChatConversationMeta 表，避免重复存储
  isHidden: integer('is_hidden').default(0), // 是否在用户会话列表隐藏
  isPinned: integer('is_pinned').default(0), // 置顶
  isMuted: integer('is_muted').default(0), // 免打扰
  userReadSeq: integer('user_read_seq').default(0), // 用户已读游标
  version: integer('version').default(0), // 配置版本（基于ConversationID递增，从0开始）
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}) as unknown as IDBChatUserConversation
