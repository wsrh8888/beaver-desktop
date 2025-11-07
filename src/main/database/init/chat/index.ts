import { initChatConversationsTable } from './conversations'
import { initChatMessagesTable } from './messages'
import { initChatSyncStatusTable } from './sync-status'
import { initChatUserConversationsTable } from './user-conversations'

export const initChatTables = (db: any) => {
  const sqlite = db.$client
  // 初始化各个表
  initChatConversationsTable(sqlite)
  initChatMessagesTable(sqlite)
  initChatUserConversationsTable(sqlite)
  initChatSyncStatusTable(sqlite)
}
