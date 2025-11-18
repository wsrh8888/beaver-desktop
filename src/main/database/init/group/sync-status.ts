// 初始化群组同步状态表
export const initGroupSyncStatusTable = (sqlite: any) => {
  // 创建群组同步状态表（客户端本地维护）
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS group_sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      module TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(group_id, module)
    )
  `)

  // 创建唯一索引（如果不存在）
  try {
    sqlite.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_group_module ON group_sync_status(group_id, module)`)
  }
  catch {
    console.log('unique_group_module索引可能已存在')
  }
}
