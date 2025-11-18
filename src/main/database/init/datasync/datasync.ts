// 初始化数据同步表
export const initDatasyncTable = (sqlite: any) => {
  // 创建同步游标表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS datasync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 创建唯一索引（如果不存在）
  try {
    sqlite.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_module ON datasync(module)`)
  }
  catch {
    console.log('unique_module索引可能已存在')
  }
}
