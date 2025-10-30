// 用户表字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureUsersFields(sqlite: any) {
  const fields: string[] = [
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE users ADD COLUMN ${field}`)
    }
    catch {
      // 字段已存在，忽略错误
      console.error('Chat conversations table field already exists')
    }
  })
}

// 用户表初始化
export const initUserTable = (db: any) => {
  const sqlite = db.$client

  // 先执行字段补齐，确保老用户的数据库结构完整
  ensureUsersFields(sqlite)

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
