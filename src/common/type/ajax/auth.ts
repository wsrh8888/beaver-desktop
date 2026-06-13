// 手机号登录请求
export interface IPhoneLoginReq {
  phone: string
  password: string
  deviceId?: string
}

// 手机号登录响应
export interface IPhoneLoginRes {
  token: string
  userId: string
}

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

// OAuth 授权码登录（PC 客户端 SDK 登录后换取 IM Token）
export interface IOAuthCodeLoginReq {
  appId: string
  code: string
  deviceId?: string
}

export interface IOAuthCodeLoginRes {
  token: string
  userId: string
}

// 用户认证请求
export interface IAuthenticationReq {
  token?: string
  validPath?: string
}

// 用户认证响应
export interface IAuthenticationRes {
  userId: string
}

// 手机号注册请求
export interface IPhoneRegisterReq {
  phone: string
  password: string
  code: string
}

// 手机号注册响应
export interface IPhoneRegisterRes {
  message: string
}

// 邮箱注册请求
export interface IEmailRegisterReq {
  email: string
  password: string
  code: string
}

// 邮箱注册响应
export interface IEmailRegisterRes {
  message: string
}

// 用户登出请求
export interface ILogoutReq {}

// 用户登出响应
export interface ILogoutRes {}

// 获取手机验证码请求
export interface IGetPhoneCodeReq {
  phone: string
  type: string // 验证码类型：register(注册)、reset(重置密码)、login(登录)、update_email(修改邮箱)
}

// 获取手机验证码响应
export interface IGetPhoneCodeRes {
  message: string
}

// 获取邮箱验证码请求
export interface IGetEmailCodeReq {
  email: string
  type: string // 验证码类型：register(注册)、reset(重置密码)、login(登录)、update_email(修改邮箱)
}

// 获取邮箱验证码响应
export interface IGetEmailCodeRes {
  message: string
}

// 邮箱登录请求
export interface IEmailLoginReq {
  email: string
  code: string
  deviceId?: string
}

// 邮箱登录响应
export interface IEmailLoginRes {
  token: string
  userId: string
}

// 忘记密码-发送重置邮件请求
export interface IForgotPasswordReq {
  email: string
}

// 忘记密码-发送重置邮件响应
export interface IForgotPasswordRes {
  message: string
}

// 重置密码请求
export interface IResetPasswordReq {
  email: string
  code: string
  password: string
}

// 重置密码响应
export interface IResetPasswordRes {
  message: string
}

// 修改密码请求
export interface IUpdatePasswordReq {
  oldPassword: string
  newPassword: string
}

// 修改密码响应
export interface IUpdatePasswordRes {}

// 设备信息
export interface IDeviceInfo {
  deviceId: string
  deviceType: string
  deviceOs: string
  deviceName: string
  lastLoginTime: string
  isActive: boolean
  lastLoginIp: string
}

// 获取登录设备列表响应
export interface IGetDevicesRes {
  devices: IDeviceInfo[]
}

// 踢下线设备请求
export interface IKickDeviceReq {
  deviceId: string
}

// 踢下线设备响应
export interface IKickDeviceRes {}
