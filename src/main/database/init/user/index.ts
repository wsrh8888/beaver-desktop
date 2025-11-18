import { initUserSyncStatusTable } from './sync-status'
import { initUserTable } from './user'

export const initUserTables = (db: any) => {
  const sqlite = db.$client

  // 初始化各个表
  initUserTable(sqlite)
  initUserSyncStatusTable(sqlite)
}
