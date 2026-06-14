export const initChatMessageMediasTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_message_medias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, message_id)
    )
  `)
}
