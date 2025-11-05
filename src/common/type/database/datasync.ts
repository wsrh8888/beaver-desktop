// 数据同步表
export interface IDBDatasync {
  id?: number
  userId: string
  deviceId: string
  dataType: string // users/friends/groups/chat_messages/chat_conversation_metas/chat_user_conversations
  conversationId?: string // 会话ID（仅聊天消息使用）
  lastSeq?: number // 最后同步的序列号（消息用）或版本号（基础数据用）
  syncStatus?: string // pending/syncing/completed/failed
  createdAt?: number
  updatedAt?: number
}
