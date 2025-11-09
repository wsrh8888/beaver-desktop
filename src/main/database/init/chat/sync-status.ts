// 初始化聊天同步状态表
export const initSyncStatusTable = (sqlite: any) => {
  // 创建聊天同步状态表（客户端本地维护）
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT NOT NULL,
      module TEXT NOT NULL,
      seq INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(conversation_id, module)
    )
  `)

  // 创建唯一索引（如果不存在）
  try {
    sqlite.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_conversation_module ON chat_sync_status(conversation_id, module)`)
  }
  catch {
    console.log('unique_conversation_module索引可能已存在')
  }
}
