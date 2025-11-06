// 初始化群组表
export const initGroupsTable = (sqlite: any) => {
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

  // 简单字段补齐
  const fields = [
    'version INTEGER DEFAULT 1',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE groups ADD COLUMN ${field}`)
    }
    catch (error: any) {
      // 忽略已存在的列错误
      if (!error.message?.includes('duplicate column name')) {
        console.log(`groups表的${field.split(' ')[0]}字段可能已存在`)
      }
    }
  })
}
