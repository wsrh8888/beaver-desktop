import { fixChatDatabase, initChatTables } from './chat'
import { initDatasyncTable } from './datasync'
import { initFriendTables } from './friend'
import { initGroupTables } from './group'
import { initMediaTable } from './media'
import { initUserTable } from './user'

export const initTables = (db: any) => {
  initUserTable(db)
  initFriendTables(db)
  initGroupTables(db)

  // 初始化聊天表，如果有问题会自动修复
  try {
    initChatTables(db)
  }
  catch (error) {
    console.warn('Chat tables initialization failed, attempting fix...', error)
    try {
      fixChatDatabase(db)
    }
    catch (fixError) {
      console.error('Chat database fix also failed:', fixError)
      throw fixError
    }
  }

  initDatasyncTable(db)
  initMediaTable(db)
}
