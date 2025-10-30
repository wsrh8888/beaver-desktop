// 媒体表字段补齐 - 确保老用户的数据库结构与新版本兼容
function ensureMediaFields(sqlite: any) {
  const fields: string[] = [
    // 如果以后添加新字段，在这里添加：
    // 'new_field TEXT',
  ]

  fields.forEach((field) => {
    try {
      sqlite.exec(`ALTER TABLE media ADD COLUMN ${field}`)
    }
    catch {
      console.error('Chat conversations table field already exists')
      // 字段已存在，忽略错误
    }
  })
}

// 媒体表初始化
export const initMediaTable = (db: any) => {
  const sqlite = db.$client

  // 先执行字段补齐，确保老用户的数据库结构完整
  ensureMediaFields(sqlite)

  // 创建媒体表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL UNIQUE, -- 文件名（MD5 + 后缀）
      path TEXT NOT NULL,             -- 文件相对路径或绝对路径
      type TEXT NOT NULL,             -- 媒体类型：image/video/voice/file/avatar/emoticon/temp/thumbnail
      size INTEGER,                    -- 文件大小（字节）
      created_at INTEGER DEFAULT (strftime('%s', 'now')), -- 创建时间
      updated_at INTEGER DEFAULT (strftime('%s', 'now')), -- 更新时间
      is_deleted INTEGER DEFAULT 0     -- 是否已删除：0正常，1已删除（软删除）
    )
  `)
}
