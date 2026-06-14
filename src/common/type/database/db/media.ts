// 媒体表
export interface IDBMedia {
  id?: number
  url: string // 完整远程 URL
  md5?: string // 文件内容 MD5
  path: string // 文件相对路径或绝对路径
  type: string // 媒体类型：image/video/voice/file/avatar/emoticon/temp/thumbnail
  size?: number // 文件大小（字节）
  createdAt?: number
  updatedAt?: number
  isDeleted?: number
}
