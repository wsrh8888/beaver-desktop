// 初始化表情包表
export const initEmojiPackageTable = (sqlite: any) => {
  // 创建表情包表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS emoji_package (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      cover_file TEXT,
      user_id TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      status INTEGER DEFAULT 1,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
