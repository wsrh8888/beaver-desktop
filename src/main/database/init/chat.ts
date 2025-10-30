// 聊天消息表(ChatMessage)字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureChatsFields(sqlite: any) {
  const fields: string[] = [
    'seq INTEGER DEFAULT 0',
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE chat_messages ADD COLUMN ${field}`)
    }
    catch {
      console.error('Chat messages table field already exists')

      // 字段已存在，忽略错误
    }
  })
}

// 聊天会话表(ChatConversationMeta)字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureChatConversationsFields(sqlite: any) {
  const fields: string[] = [
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE chat_conversation_metas ADD COLUMN ${field}`)
    }
    catch {
      // 字段已存在，忽略错误
      console.error('Chat conversation metas table field already exists')
    }
  })
}

// 用户会话表(ChatUserConversation)字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureChatUserConversationsFields(sqlite: any) {
  const fields: string[] = [
    'last_read_seq INTEGER DEFAULT 0',
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE chat_user_conversations ADD COLUMN ${field}`)
    }
    catch {
      // 字段已存在，忽略错误
      console.error('Chat user conversations table field already exists')
    }
  })
}

// 聊天相关表初始化
export const initChatTables = (db: any) => {
  const sqlite = db.$client

  // 先执行字段补齐，确保老用户的数据库结构完整
  ensureChatsFields(sqlite)
  ensureChatConversationsFields(sqlite)
  ensureChatUserConversationsFields(sqlite)

  // 创建聊天消息表 (ChatMessage)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL UNIQUE,
      conversation_id TEXT NOT NULL,
      send_user_id TEXT NOT NULL,
      msg_type INTEGER NOT NULL,
      msg_preview TEXT,
      msg TEXT NOT NULL,
      is_deleted INTEGER DEFAULT 0,
      seq INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 创建聊天会话表 (ChatConversationMeta)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_conversation_metas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT NOT NULL UNIQUE,
      type INTEGER NOT NULL,
      last_read_seq INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 创建用户会话表 (ChatUserConversation)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_user_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      conversation_id TEXT NOT NULL,
      last_message TEXT,
      is_deleted INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      last_read_seq INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, conversation_id)
    )
  `)
}
