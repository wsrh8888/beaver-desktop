// 初始化聊天同步状态表
export const initChatSyncStatusTable = (sqlite: any) => {
  // 创建聊天同步状态表（客户端本地维护）
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT NOT NULL UNIQUE,
      message_seq INTEGER DEFAULT 0,
      conversation_version INTEGER DEFAULT 0,
      setting_version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 为旧表添加缺失的字段
  const fields = [
    'setting_version INTEGER DEFAULT 0',
  ]

  fields.forEach((field) => {
    try {
      sqlite.run(`ALTER TABLE chat_sync_status ADD COLUMN ${field}`)
    }
    catch (error: any) {
      // 忽略已存在的列错误
      if (!error.message?.includes('duplicate column name')) {
        console.log(`chat_sync_status表的${field.split(' ')[0]}字段可能已存在`)
      }
    }
  })
}
