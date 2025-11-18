// 初始化用户同步状态表
export const initUserSyncStatusTable = (sqlite: any) => {
  // 创建用户同步状态表（客户端本地维护）
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS user_sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      user_version INTEGER DEFAULT 0,
      last_sync_time INTEGER DEFAULT 0,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
