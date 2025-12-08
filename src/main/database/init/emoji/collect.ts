// 初始化表情收藏表
export const initEmojiCollectTable = (sqlite: any) => {
  // 创建表情收藏表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS emoji_collect (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emoji_collect_id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      emoji_id INTEGER NOT NULL,
      is_deleted INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
  try {
    sqlite.exec(`ALTER TABLE emoji_collect ADD COLUMN is_deleted INTEGER DEFAULT 0`)
  } catch (err) {
    console.error(err)
    // ignore if column already exists
  }
}
