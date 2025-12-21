// 媒体表
export interface IDBMedia {
  id?: number
  fileKey: string // 文件名（MD5 + 后缀）
  path: string // 文件相对路径或绝对路径
  type: string // 媒体类型：image/video/voice/file/avatar/emoticon/temp/thumbnail
  size?: number // 文件大小（字节）
  createdAt?: number
  updatedAt?: number
  isDeleted?: number
}
