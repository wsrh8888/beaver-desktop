// 初始化聊天会话表
export const initChatConversationsTable = (sqlite: any) => {
  // 创建表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_conversation_metas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT NOT NULL UNIQUE,
      type INTEGER NOT NULL,
      max_seq INTEGER DEFAULT 0,
      last_message TEXT,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 简单字段补齐 - 只处理必要的字段
  const fields = [
    'max_seq INTEGER DEFAULT 0',
    'last_message TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE chat_conversation_metas ADD COLUMN ${field}`)
    }
    catch (error: any) {
      // 忽略已存在的列错误
      if (!error.message?.includes('duplicate column name')) {
        console.log(`chat_conversation_metas表的${field.split(' ')[0]}字段可能已存在`)
      }
    }
  })
}
