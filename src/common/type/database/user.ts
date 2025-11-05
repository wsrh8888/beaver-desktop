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
