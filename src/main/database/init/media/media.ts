// 初始化媒体表
export const initMediaTable = (sqlite: any) => {
  // 创建媒体表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_key TEXT NOT NULL UNIQUE, -- 文件名（MD5 + 后缀）
      path TEXT NOT NULL,             -- 文件相对路径或绝对路径
      type TEXT NOT NULL,             -- 媒体类型：image/video/voice/file/avatar/emoticon/temp/thumbnail
      size INTEGER,                    -- 文件大小（字节）
      created_at INTEGER DEFAULT (strftime('%s', 'now')), -- 创建时间
      updated_at INTEGER DEFAULT (strftime('%s', 'now')), -- 更新时间
      is_deleted INTEGER DEFAULT 0     -- 是否已删除：0正常，1已删除（软删除）
    )
  `)
}
