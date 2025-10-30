// 数据同步表字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureDatasyncFields(sqlite: any) {
  const fields: string[] = [
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE datasync ADD COLUMN ${field}`)
    }
    catch {
      // 字段已存在，忽略错误
      console.error('Chat conversations table field already exists')
    }
  })
}

// 数据同步表初始化
export const initDatasyncTable = (db: any) => {
  const sqlite = db.$client

  // 先执行字段补齐，确保老用户的数据库结构完整
  ensureDatasyncFields(sqlite)

  // 创建同步游标表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS datasync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      device_id TEXT NOT NULL,
      data_type TEXT NOT NULL,
      conversation_id TEXT,
      last_seq INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'pending',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
