import { initDatasyncTable } from './datasync'
import { initSyncStatusTable } from './sync-status'

export const initDatasyncTables = (db: any) => {
  const sqlite = db.$client

  // 初始化各个表
  initDatasyncTable(sqlite)
  initSyncStatusTable(sqlite)
}
