// 用户信息响应
export interface IUserInfoRes {
  userId: string
  nickName: string
  fileName: string // 修正：服务器端是fileName不是avatar
  abstract: string
  phone?: string
  email?: string
  gender: number
}
