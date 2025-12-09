// 初始化通知已读游标表
export const initNotificationReadCursorsTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notification_read_cursors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      last_event_id TEXT,
      last_read_at INTEGER,
      last_read_time INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, category)
    )
  `)

  const columns = [
    'version INTEGER DEFAULT 0',
    'last_event_id TEXT',
    'last_read_at INTEGER',
    'last_read_time INTEGER',
  ]

  columns.forEach((column) => {
    try {
      sqlite.run(`ALTER TABLE notification_read_cursors ADD COLUMN ${column}`)
    }
    catch (error: any) {
      if (!error.message?.includes('duplicate column name'))
        console.log(`notification_read_cursors表的${column.split(' ')[0]}字段可能已存在`)
    }
  })
}
