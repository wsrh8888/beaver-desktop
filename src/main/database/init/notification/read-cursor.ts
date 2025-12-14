// 初始化通知已读游标表
export const initNotificationReadsTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notification_reads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      last_read_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, category)
    )
  `)

  const columns = [
    'version INTEGER DEFAULT 0',
    'last_read_at INTEGER',
  ]

  columns.forEach((column) => {
    try {
      sqlite.run(`ALTER TABLE notification_reads ADD COLUMN ${column}`)
    }
    catch (error: any) {
      if (!error.message?.includes('duplicate column name'))
        console.log(`notification_reads表的${column.split(' ')[0]}字段可能已存在`)
    }
  })
}
