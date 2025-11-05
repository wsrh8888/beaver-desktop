// 群组表字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureGroupsFields(sqlite: any) {
  const fields: string[] = [
    // 添加version字段用于数据同步
    'version INTEGER DEFAULT 1',
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
  try {
    // 检查表结构
    const result = sqlite.exec('PRAGMA table_info(group_members)')
    const columns = result[0]?.values || []
    const hasIdColumn = columns.some((col: any) => col[1] === 'id')
    const hasVersionColumn = columns.some((col: any) => col[1] === 'version')

    if (!hasIdColumn) {
      // 如果没有id字段，需要重建表
      console.log('Migrating group_members table: adding id column')

      // 重命名旧表
      sqlite.exec('ALTER TABLE group_members RENAME TO group_members_old')

      // 创建新表
      sqlite.exec(`
        CREATE TABLE group_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          group_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          role INTEGER DEFAULT 3,
          status INTEGER DEFAULT 1,
          version INTEGER DEFAULT 0,
          created_at INTEGER DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
      `)

      // 复制数据
      sqlite.exec(`
        INSERT INTO group_members (group_id, user_id, role, status, version, created_at, updated_at)
        SELECT group_id, user_id, role, status, version, created_at, updated_at
        FROM group_members_old
      `)

      // 删除旧表
      sqlite.exec('DROP TABLE group_members_old')

      console.log('Group members table migration completed')
    }
    else if (!hasVersionColumn) {
      // 如果有id字段但没有version字段，添加version字段
      sqlite.exec('ALTER TABLE group_members ADD COLUMN version INTEGER DEFAULT 0')
    }
  }
  catch (error) {
    console.error('Group members table migration failed:', error)
    // 如果迁移失败，尝试创建表
    try {
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS group_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          group_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          role INTEGER DEFAULT 3,
          status INTEGER DEFAULT 1,
          version INTEGER DEFAULT 0,
          created_at INTEGER DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
      `)
    }
    catch (createError) {
      console.error('Failed to create group_members table:', createError)
    }
  }
}

// 入群申请表字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureGroupJoinRequestsFields(sqlite: any) {
  const fields: string[] = [
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE group_join_requests ADD COLUMN ${field}`)
    }
    catch {
      console.error('Group join requests table field already exists')
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
  ensureGroupJoinRequestsFields(sqlite)

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
      version INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 创建群成员表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role INTEGER DEFAULT 3,
      status INTEGER DEFAULT 1,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 创建入群申请表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS group_join_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      applicant_user_id TEXT NOT NULL,
      message TEXT,
      status INTEGER DEFAULT 0,
      handled_by TEXT,
      handled_at INTEGER,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 创建群组同步状态表（客户端本地维护）
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS group_sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL UNIQUE,
      group_version INTEGER DEFAULT 0,
      member_version INTEGER DEFAULT 0,
      request_version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
