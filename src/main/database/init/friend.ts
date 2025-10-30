// 好友验证表字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureFriendVerifiesFields(sqlite: any) {
  const fields: string[] = [
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE friend_verifies ADD COLUMN ${field}`)
    }
    catch {
      // 字段已存在，忽略错误
      console.error('Chat conversations table field already exists')
    }
  })
}

// 好友表字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureFriendsFields(sqlite: any) {
  const fields: string[] = [
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE friends ADD COLUMN ${field}`)
    }
    catch {
      console.error('Chat conversations table field already exists')

      // 字段已存在，忽略错误
    }
  })
}

// 好友相关表初始化
export const initFriendTables = (db: any) => {
  const sqlite = db.$client

  // 先执行字段补齐，确保老用户的数据库结构完整
  ensureFriendVerifiesFields(sqlite)
  ensureFriendsFields(sqlite)

  // 创建好友验证表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS friend_verifies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
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
