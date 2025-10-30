import { initChatTables } from './chat'
import { initDatasyncTable } from './datasync'
import { initFriendTables } from './friend'
import { initGroupTables } from './group'
import { initMediaTable } from './media'
import { initUserTable } from './user'

export const initTables = (db: any) => {
  initUserTable(db)
  initFriendTables(db)
  initGroupTables(db)
  initChatTables(db)
  initDatasyncTable(db)
  initMediaTable(db)
}
