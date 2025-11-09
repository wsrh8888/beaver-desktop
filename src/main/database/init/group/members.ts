// 初始化群成员表
export const initGroupMembersTable = (sqlite: any) => {
  // 创建群成员表 (与服务器端 group_models.GroupMemberModel 保持一致)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role INTEGER DEFAULT 3,
      status INTEGER DEFAULT 1,
      join_time INTEGER DEFAULT (strftime('%s', 'now')),
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  const fields = [
    'join_time INTEGER DEFAULT (strftime(\'%s\', \'now\'))',
    'version INTEGER DEFAULT 0',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE group_members ADD COLUMN ${field}`)
    }
    catch (error: any) {
      // 忽略已存在的列错误
      if (!error.message?.includes('duplicate column name')) {
        console.log(`group_members表的${field.split(' ')[0]}字段可能已存在`)
      }
    }
  })
}
