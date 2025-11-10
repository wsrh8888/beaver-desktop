// 初始化好友表
export const initFriendsTable = (sqlite: any) => {
  // 创建好友表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
      send_user_id TEXT NOT NULL,
      rev_user_id TEXT NOT NULL,
      send_user_notice TEXT,
      rev_user_notice TEXT,
      source TEXT,
      is_deleted INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
