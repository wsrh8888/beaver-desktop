// 群组表字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureGroupsFields(sqlite: any) {
  const fields: string[] = [
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE groups ADD COLUMN ${field}`)
    }
    catch {
      console.error('Chat conversations table field already exists')

      // 字段已存在，忽略错误
    }
  })
}

// 群成员表字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureGroupMembersFields(sqlite: any) {
  const fields: string[] = [
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE group_members ADD COLUMN ${field}`)
    }
    catch {
      console.error('Chat conversations table field already exists')
      // 字段已存在，忽略错误
    }
  })
}

// 群组相关表初始化
export const initGroupTables = (db: any) => {
  const sqlite = db.$client

  // 先执行字段补齐，确保老用户的数据库结构完整
  ensureGroupsFields(sqlite)
  ensureGroupMembersFields(sqlite)

  // 创建群组表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
      type INTEGER DEFAULT 1,
      title TEXT NOT NULL,
      file_name TEXT DEFAULT '71e4be6c-b477-4fce-8348-9cc53349ef28.png',
      creator_id TEXT NOT NULL,
      notice TEXT,
      join_type INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 创建群成员表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER NOT NULL,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role INTEGER DEFAULT 3,
      status INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      PRIMARY KEY (group_id, user_id)
    )
  `)
}
