// 初始化表情包与表情关联表
export const initEmojiPackageEmojiTable = (sqlite: any) => {
  // 创建表情包与表情的多对多关联表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS emoji_package_emoji (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      relation_id TEXT NOT NULL UNIQUE,
      package_id TEXT NOT NULL,
      emoji_id TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
