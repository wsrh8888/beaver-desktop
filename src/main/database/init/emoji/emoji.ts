// 初始化表情表
export const initEmojiTable = (sqlite: any) => {
  // 创建表情表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS emoji (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emoji_id TEXT NOT NULL UNIQUE,
      file_key TEXT NOT NULL,
      title TEXT NOT NULL,
      status INTEGER DEFAULT 1,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
