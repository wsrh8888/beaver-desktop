// 初始化表情包收藏表
export const initEmojiPackageCollectTable = (sqlite: any) => {
  // 创建表情包收藏表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS emoji_package_collect (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      package_id INTEGER NOT NULL,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
