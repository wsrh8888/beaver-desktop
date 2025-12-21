// 初始化通知事件表
export const initNotificationEventsTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notification_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      category TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      from_user_id TEXT,
      target_id TEXT,
      target_type TEXT NOT NULL,
      payload TEXT,
      priority INTEGER DEFAULT 5,
      status INTEGER DEFAULT 1,
      dedup_hash TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  const columns = [
    'version INTEGER DEFAULT 0',
    'from_user_id TEXT',
    'target_id TEXT',
    'payload TEXT',
    'priority INTEGER DEFAULT 5',
    'status INTEGER DEFAULT 1',
    'dedup_hash TEXT',
  ]

  columns.forEach((column) => {
    try {
      sqlite.run(`ALTER TABLE notification_events ADD COLUMN ${column}`)
    }
    catch (error: any) {
      if (!error.message?.includes('duplicate column name'))
        console.log(`notification_events表的${column.split(' ')[0]}字段可能已存在`)
    }
  })
}
