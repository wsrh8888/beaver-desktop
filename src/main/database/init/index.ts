import { initChatTables } from './chat/index'
import { initDatasyncTables } from './datasync/index'
import { initEmojiTables } from './emoji/index'
import { initFriendTables } from './friend/index'
import { initGroupTables } from './group/index'
import { initMediaTables } from './media/index'
import { initNotificationTables } from './notification/index'
import { initUserTables } from './user/index'

export const initTables = (db: any) => {
  // 初始化所有表 - 直接使用drizzle-orm的db实例
  console.log('开始初始化用户表')
  initUserTables(db)
  initFriendTables(db)
  initGroupTables(db)
  initChatTables(db)
  initEmojiTables(db)
  initDatasyncTables(db)
  initNotificationTables(db)
  initMediaTables(db)
  console.log('数据表初始化完成')
}
