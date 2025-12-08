// 初始化表情包收藏表
export const initEmojiPackageCollectTable = (sqlite: any) => {
  // 创建表情包收藏表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS emoji_package_collect (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_collect_id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      package_id INTEGER NOT NULL,
      is_deleted INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
  try {
    sqlite.exec(`ALTER TABLE emoji_package_collect ADD COLUMN is_deleted INTEGER DEFAULT 0`)
  } catch (_err) {
    // ignore if column already exists
  }
}
