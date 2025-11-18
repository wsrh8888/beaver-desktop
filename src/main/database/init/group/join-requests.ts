// 初始化入群申请表
export const initGroupJoinRequestsTable = (sqlite: any) => {
  // 创建入群申请表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS group_join_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      applicant_user_id TEXT NOT NULL,
      message TEXT,
      status INTEGER DEFAULT 0,
      handled_by TEXT,
      handled_at INTEGER,
      version INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)
}
