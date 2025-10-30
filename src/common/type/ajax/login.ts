// 邮箱密码登录请求
export interface IEmailPasswordLoginReq {
  email: string
  password: string
  deviceId?: string
}
// 邮箱密码登录响应
export interface IEmailPasswordLoginRes {
  token: string
  userId: string
}

export interface ILoginRes {
  userId: string
  token: string
}
export interface IUpdateInfoReq {
  nick_name?: string
  avatar?: string
  bio?: string
  gender?: string
  birthday?: string
  phone?: string
}
