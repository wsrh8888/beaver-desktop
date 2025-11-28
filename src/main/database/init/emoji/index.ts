import { initEmojiCollectTable } from './collect'
// 导入各表的初始化函数
import { initEmojiTable } from './emoji'
import { initEmojiPackageTable } from './package'
import { initEmojiPackageCollectTable } from './package_collect'
import { initEmojiPackageEmojiTable } from './package_emoji'

// 表情相关表初始化
export const initEmojiTables = (db: any) => {
  const sqlite = db.$client

  // 初始化各个表
  initEmojiTable(sqlite)
  initEmojiCollectTable(sqlite)
  initEmojiPackageTable(sqlite)
  initEmojiPackageEmojiTable(sqlite)
  initEmojiPackageCollectTable(sqlite)
}
