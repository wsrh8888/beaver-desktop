// 初始化用户表
export const initUserTable = (sqlite: any) => {
  // 创建用户表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
      nick_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      avatar TEXT,
      abstract TEXT,
      gender INTEGER DEFAULT 3,
      status INTEGER DEFAULT 1,
      source INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
