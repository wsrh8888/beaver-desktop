// 聊天消息表(ChatMessage)字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureChatsFields(sqlite: any) {
  const fields: string[] = [
    'seq INTEGER DEFAULT 0',
    'target_message_id TEXT',
    'conversation_type INTEGER NOT NULL DEFAULT 1', // 添加默认值避免 NOT NULL 约束问题
    'send_status INTEGER DEFAULT 1', // 发送状态 (0=发送中 1=已发送 2=发送失败)

    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE chat_messages ADD COLUMN ${field}`)
      console.log(`Successfully added column: ${field}`)
    }
    catch (error: any) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('duplicate column name')) {
        console.log(`Column already exists: ${field}`)
      }
      else {
        console.error(`Error adding column ${field}:`, error)
        throw error // 重新抛出非重复列的错误
      }
    }
  })
}

// 聊天会话表(ChatConversationMeta)字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureChatConversationsFields(sqlite: any) {
  const fields: string[] = [
    'max_seq INTEGER DEFAULT 0',
    'last_message TEXT',
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
    'is_hidden INTEGER DEFAULT 0',
    'is_muted INTEGER DEFAULT 0',
    'user_read_seq INTEGER DEFAULT 0',
    // last_message 已移至 chat_conversation_metas 表，不再需要
    // joined_at 已移除，不再需要
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

  console.log('Starting chat tables initialization...')

  // 先执行字段补齐，确保老用户的数据库结构完整
  console.log('Ensuring chat fields...')
  ensureChatsFields(sqlite)
  console.log('Ensuring chat conversation fields...')
  ensureChatConversationsFields(sqlite)
  console.log('Ensuring chat user conversation fields...')
  ensureChatUserConversationsFields(sqlite)

  // 创建聊天消息表 (ChatMessage)
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

  // 创建聊天会话表 (ChatConversationMeta)
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

  // 创建用户会话表 (ChatUserConversation)
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

  console.log('Chat tables initialization completed')
}

// 数据库修复函数 - 用于手动检查和修复现有数据库
export const fixChatDatabase = (db: any) => {
  const sqlite = db.$client

  console.log('Starting database fix for chat tables...')

  try {
    // 检查表是否存在
    const tables = sqlite.prepare('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'chat_messages\'').all()
    if (tables.length === 0) {
      console.log('Chat messages table does not exist, creating...')
      initChatTables(db)
      return
    }

    console.log('Checking chat_messages table structure...')

    // 检查 conversation_type 列是否存在
    const columns = sqlite.prepare('PRAGMA table_info(chat_messages)').all()
    const hasConversationType = columns.some((col: any) => col.name === 'conversation_type')

    if (!hasConversationType) {
      console.log('Adding missing conversation_type column...')
      try {
        sqlite.exec(`ALTER TABLE chat_messages ADD COLUMN conversation_type INTEGER NOT NULL DEFAULT 1`)
        console.log('Successfully added conversation_type column')
      }
      catch (error: any) {
        console.error('Failed to add conversation_type column:', error)
        throw error
      }
    }
    else {
      console.log('conversation_type column already exists')
    }

    // 检查其他缺失的列
    const requiredColumns = ['seq', 'target_message_id', 'send_status']
    for (const colName of requiredColumns) {
      const hasColumn = columns.some((col: any) => col.name === colName)
      if (!hasColumn) {
        console.log(`Adding missing ${colName} column...`)
        try {
          if (colName === 'seq') {
            sqlite.exec(`ALTER TABLE chat_messages ADD COLUMN seq INTEGER DEFAULT 0`)
          }
          else if (colName === 'target_message_id') {
            sqlite.exec(`ALTER TABLE chat_messages ADD COLUMN target_message_id TEXT`)
          }
          else if (colName === 'send_status') {
            sqlite.exec(`ALTER TABLE chat_messages ADD COLUMN send_status INTEGER DEFAULT 1`)
          }
          console.log(`Successfully added ${colName} column`)
        }
        catch (error: any) {
          console.error(`Failed to add ${colName} column:`, error)
        }
      }
    }

    console.log('Database fix completed successfully')
  }
  catch (error) {
    console.error('Database fix failed:', error)
    throw error
  }
}
