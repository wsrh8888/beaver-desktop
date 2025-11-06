// 初始化聊天消息表
export const initChatMessagesTable = (sqlite: any) => {
  // 创建表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL UNIQUE,
      conversation_id TEXT NOT NULL,
      conversation_type INTEGER NOT NULL,
      seq INTEGER DEFAULT 0,
      send_user_id TEXT,
      msg_type INTEGER NOT NULL,
      target_message_id TEXT,
      msg_preview TEXT,
      msg TEXT,
      send_status INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 简单字段补齐
  const fields = [
    'seq INTEGER DEFAULT 0',
    'target_message_id TEXT',
    'conversation_type INTEGER NOT NULL DEFAULT 1',
    'send_status INTEGER DEFAULT 1',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE chat_messages ADD COLUMN ${field}`)
    }
    catch (error: any) {
      // 忽略已存在的列错误
      if (!error.message?.includes('duplicate column name')) {
        console.log(`chat_messages表的${field.split(' ')[0]}字段可能已存在`)
      }
    }
  })
}
