// 初始化群组同步状态表
export const initGroupSyncStatusTable = (sqlite: any) => {
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
