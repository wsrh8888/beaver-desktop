import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

// 聊天消息表 (ChatMessage)
export const chats = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  messageId: text('message_id').notNull().unique(),
  conversationId: text('conversation_id').notNull(),
  conversationType: integer('conversation_type').notNull(), // 1=私聊 2=群聊 3=系统会话
  sendUserId: text('send_user_id').notNull(),
  msgType: integer('msg_type').notNull(),
  msgPreview: text('msg_preview'),
  msg: text('msg').notNull(), // JSON格式的消息内容
  seq: integer('seq').default(0), // 序列号，用于数据同步
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
})

// 聊天会话表 (ChatConversationMeta)
export const chatConversations = sqliteTable('chat_conversation_metas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: text('conversation_id').notNull(),
  type: integer('type').notNull(), // 1=私聊 2=群聊 3=系统会话
  lastReadSeq: integer('last_read_seq').default(0),
  version: integer('version').default(0),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  conversationIdIdx: unique().on(table.conversationId),
}))

// 用户会话表 (ChatUserConversation)
export const chatUserConversations = sqliteTable('chat_user_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  conversationId: text('conversation_id').notNull(),
  lastMessage: text('last_message'),
  isDeleted: integer('is_deleted').default(0),
  isPinned: integer('is_pinned').default(0),
  lastReadSeq: integer('last_read_seq').default(0), // 用户已读到的消息Seq
  version: integer('version').default(0),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  userConversationIdx: unique().on(table.userId, table.conversationId),
}))
