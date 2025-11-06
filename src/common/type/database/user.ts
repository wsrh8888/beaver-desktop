// 用户表
export interface IDBUser {
  id?: number
  uuid: string
  nickName: string
  email?: string
  phone?: string
  avatar?: string
  abstract?: string // 个性签名
  gender?: number // 性别：1男 2女 3未知
  status?: number
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 用户同步状态表（客户端本地维护）
export interface IDBUserSyncStatus {
  id?: number
  userId: string // 用户ID
  userVersion: number // 用户资料版本号
  lastSyncTime: number // 最后同步时间戳
  syncStatus: string // 同步状态：pending/syncing/completed/failed
  retryCount: number // 重试次数
  createdAt?: number
  updatedAt?: number
}
