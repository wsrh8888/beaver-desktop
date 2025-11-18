// 导入各表的初始化函数
import { initMediaTable } from './media'
// 群组相关表初始化
export const initMediaTables = (db: any) => {
  const sqlite = db.$client

  // 初始化各个表

  initMediaTable(sqlite)
}
