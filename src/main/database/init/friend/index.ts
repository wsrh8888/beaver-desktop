// 导入各表的初始化函数
import { initFriendsTable } from './friends'
import { initFriendVerifiesTable } from './verifies'

// 好友相关表初始化
export const initFriendTables = (db: any) => {
  const sqlite = db.$client

  // 初始化各个表
  initFriendVerifiesTable(sqlite)
  initFriendsTable(sqlite)
}
