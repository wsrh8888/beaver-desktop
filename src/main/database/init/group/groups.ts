// 初始化群组表
export const initGroupsTable = (sqlite: any) => {
  // 创建群组表 (与服务器端 group_models.GroupModel 保持一致)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL UNIQUE,
      type INTEGER DEFAULT 1,
      title TEXT NOT NULL,
      avatar TEXT DEFAULT 'a9de5548bef8c10b92428fff61275c72.png',
      creator_id TEXT NOT NULL,
      notice TEXT,
      join_type INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 添加索引
  // sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_groups_group_id ON groups(group_id)`)
}
