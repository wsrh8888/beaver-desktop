// 初始化好友表
export const initFriendsTable = (sqlite: any) => {
  // 创建好友表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
      friendship_id TEXT UNIQUE,
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

  // 为已存在的记录生成friendship_id
  sqlite.exec(`
    UPDATE friends
    SET friendship_id = CASE
      WHEN send_user_id < rev_user_id THEN send_user_id || '_' || rev_user_id
      ELSE rev_user_id || '_' || send_user_id
    END
    WHERE friendship_id IS NULL OR friendship_id = ''
  `)
}
