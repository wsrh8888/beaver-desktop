import { initChatConversationsTable } from './chat/conversations'
import { initChatMessagesTable } from './chat/messages'
import { initChatUserConversationsTable } from './chat/user-conversations'
import { initDatasyncTable } from './datasync/init'
import { initFriendTables } from './friend/index'
import { initGroupTables } from './group/index'
import { initMediaTable } from './media/init'
import { initUserTable } from './user/init'

export const initTables = (db: any) => {
  initUserTable(db)
  initFriendTables(db)
  initGroupTables(db)

  // 初始化聊天表
  const sqlite = db.$client
  initChatMessagesTable(sqlite)
  initChatConversationsTable(sqlite)
  initChatUserConversationsTable(sqlite)

  initDatasyncTable(db)
  initMediaTable(db)
}
