import { initChatConversationsTable } from './conversations'
import { initChatMessageMediasTable } from './message-medias'
import { initChatMessagesTable } from './messages'
import { initSyncStatusTable } from './sync-status'
import { initChatUserConversationsTable } from './user-conversations'

export const initChatTables = (db: any) => {
  const sqlite = db.$client
  initChatConversationsTable(sqlite)
  initChatMessagesTable(sqlite)
  initChatUserConversationsTable(sqlite)
  initChatMessageMediasTable(sqlite)
  initSyncStatusTable(sqlite)
}
