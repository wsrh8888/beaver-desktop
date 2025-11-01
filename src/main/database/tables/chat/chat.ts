import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

// 聊天消息表 (ChatMessage)
export const chats = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  messageId: text('message_id').notNull().unique(), // 唯一消息ID
  conversationId: text('conversation_id').notNull(), // 所属会话ID
  seq: integer('seq').default(0), // 消息在会话内的序列号
  sendUserId: text('send_user_id'), // 发送者用户ID（系统消息可为null）
  msgType: integer('msg_type').notNull(), // 消息类型
  targetMessageId: text('target_message_id'), // 针对的原消息ID（撤回/删除/编辑事件）
  msgPreview: text('msg_preview'), // 消息预览文本
  msg: text('msg'), // 消息内容（JSON）
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
})

// 聊天会话表 (ChatConversationMeta) - 全局表
export const chatConversations = sqliteTable('chat_conversation_metas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: text('conversation_id').notNull().unique(), // 会话UUID，全局唯一
  type: integer('type').notNull(), // 1=私聊 2=群聊 3=系统会话
  maxSeq: integer('max_seq').default(0), // 会话最新消息序号
  lastMessage: text('last_message'), // 会话最后一条消息预览（全局唯一）
  version: integer('version').default(0), // 会话版本号
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
})

// 用户会话表 (ChatUserConversation)
export const chatUserConversations = sqliteTable('chat_user_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  conversationId: text('conversation_id').notNull(),
  joinedAt: integer('joined_at').default(0), // 用户加入会话的时间戳
  // lastMessage 已移至 ChatConversationMeta 表，避免重复存储
  isHidden: integer('is_hidden').default(0), // 是否在用户会话列表隐藏
  isPinned: integer('is_pinned').default(0), // 置顶
  isMuted: integer('is_muted').default(0), // 免打扰
  userReadSeq: integer('user_read_seq').default(0), // 用户已读游标
  version: integer('version').default(0), // 配置版本
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
}, table => ({
  userConversationIdx: unique().on(table.userId, table.conversationId),
}))
