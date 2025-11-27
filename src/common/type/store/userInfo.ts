// 用户基本信息（前端状态存储）
export interface IUserInfo {
  userId: string
  nickName: string
  avatar: string
  abstract: string
  phone?: string
  email?: string
  gender: number
  version: number
}
