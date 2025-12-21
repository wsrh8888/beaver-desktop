// 初始化好友验证表
export const initFriendVerifiesTable = (sqlite: any) => {
  // 创建好友验证表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS friend_verifies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verify_id TEXT NOT NULL UNIQUE,
      send_user_id TEXT NOT NULL,
      rev_user_id TEXT NOT NULL,
      send_status INTEGER DEFAULT 0,
      rev_status INTEGER DEFAULT 0,
      message TEXT,
      source TEXT,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
