// 初始化数据同步表
export const initDatasyncTable = (sqlite: any) => {
  // 创建同步游标表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS datasync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL,
      last_seq INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'pending',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
