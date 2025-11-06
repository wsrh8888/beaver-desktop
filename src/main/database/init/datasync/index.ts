import { initDatasyncTable } from './datasync'

export const initDatasyncTables = (db: any) => {
  const sqlite = db.$client

  // 初始化各个表
  initDatasyncTable(sqlite)
}
