export const initCirclesTable = (sqlite: any) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS circles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      circle_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      description TEXT DEFAULT '',
      creator_id TEXT DEFAULT '',
      member_count INTEGER DEFAULT 0,
      role INTEGER DEFAULT 0,
      join_type INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
