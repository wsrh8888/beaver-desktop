// 初始化媒体表
export const initMediaTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      md5 TEXT,
      path TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      is_deleted INTEGER DEFAULT 0
    )
  `)
}
