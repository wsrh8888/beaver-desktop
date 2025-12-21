// 初始化通知收件箱表
export const initNotificationInboxesTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notification_inboxes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      category TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      is_read INTEGER DEFAULT 0,
      read_at INTEGER,
      status INTEGER DEFAULT 1,
      is_deleted INTEGER DEFAULT 0,
      silent INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, event_id)
    )
  `)

  const columns = [
    'version INTEGER DEFAULT 0',
    'is_read INTEGER DEFAULT 0',
    'read_at INTEGER',
    'status INTEGER DEFAULT 1',
    'is_deleted INTEGER DEFAULT 0',
    'silent INTEGER DEFAULT 0',
  ]

  columns.forEach((column) => {
    try {
      sqlite.run(`ALTER TABLE notification_inboxes ADD COLUMN ${column}`)
    }
    catch (error: any) {
      if (!error.message?.includes('duplicate column name'))
        console.log(`notification_inboxes表的${column.split(' ')[0]}字段可能已存在`)
    }
  })
}
