// 初始化同步状态表
export const initSyncStatusTable = (sqlite: any) => {
  // 创建同步状态表（客户端本地维护）
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT NOT NULL,
      business_id TEXT NOT NULL,
      seq INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(module, business_id)
    )
  `)

  // 创建唯一索引（如果不存在）
  try {
    sqlite.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_module_business ON sync_status(module, business_id)`)
  }
  catch {
    console.log('unique_module_business索引可能已存在')
  }
}
