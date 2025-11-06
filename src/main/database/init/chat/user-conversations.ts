// 初始化用户会话表
export const initChatUserConversationsTable = (sqlite: any) => {
  // 创建表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_user_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      conversation_id TEXT NOT NULL,
      is_hidden INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      is_muted INTEGER DEFAULT 0,
      user_read_seq INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, conversation_id)
    )
  `)

  // 简单字段补齐
  const fields = [
    'is_hidden INTEGER DEFAULT 0',
    'is_muted INTEGER DEFAULT 0',
    'user_read_seq INTEGER DEFAULT 0',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE chat_user_conversations ADD COLUMN ${field}`)
    }
    catch (error: any) {
      // 忽略已存在的列错误
      if (!error.message?.includes('duplicate column name')) {
        console.log(`chat_user_conversations表的${field.split(' ')[0]}字段可能已存在`)
      }
    }
  })
}
