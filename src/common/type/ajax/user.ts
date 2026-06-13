export interface IUserInfoRes {
  userId: string
  nickName: string // 用户昵称
  avatar: string // 用户头像URL
  abstract: string // 用户个性签名
  phone?: string // 用户手机号
  email?: string // 用户邮箱
  gender: number // 用户性别：1-男 2-女 0-未知
}

// 更新用户信息请求
export interface IUpdateInfoReq {
  avatar?: string // 新昵称
  fileName?: string // 新头像URL
  abstract?: string // 新个性签名
  gender?: number // 性别：1-男 2-女 0-未知
}

// 更新用户信息响应
export interface IUpdateInfoRes {
  message: string
}

// 修改密码请求（已迁移至 auth 模块，保留类型兼容）
export interface IUpdatePasswordReq {
  oldPassword: string
  newPassword: string
}

// 修改密码响应
export interface IUpdatePasswordRes {}

// 修改邮箱请求
export interface IUpdateEmailReq {
  email: string
  code: string // 验证码
}

// 修改邮箱响应
export interface IUpdateEmailRes {
  message: string
}

// 用户设置 - 隐私
export interface IUserSettingsPrivacy {
  allowFriendRequest: boolean
  showOnlineStatus: boolean
  allowSearchByPhone: boolean
  allowSearchByEmail: boolean
}

// 用户设置 - 通知策略（账号级，多端同步）
export interface IUserSettingsNotification {
  notifyFriendRequest: boolean
  notifyGroupMessage: boolean
  notifyMoment: boolean
}

// 获取用户设置响应
export interface IUserSettingsRes {
  privacy: IUserSettingsPrivacy
  notification: IUserSettingsNotification
}

// 更新用户设置请求（局部更新）
export interface IUpdateUserSettingsReq {
  privacy?: Partial<IUserSettingsPrivacy>
  notification?: Partial<IUserSettingsNotification>
}

export interface IUpdateUserSettingsRes {}

// 找回密码请求
export interface IResetPasswordReq {
  email: string
  code: string // 邮箱验证码
  password: string // 新密码
}

// 找回密码响应
export interface IResetPasswordRes {
  message: string
}

// 获取用户信息请求
export interface IUserInfoReq {
  // 用户ID从请求头获取，这里不需要参数
}

// 邮箱注册响应
export interface IEmailRegisterRes {
  message: string
}

// 获取邮箱验证码请求
export interface IGetEmailCodeReq {
  email: string
  type: string // 验证码类型：register(注册)、reset(重置密码)、login(登录)
}

// 邮箱登录响应
export interface IEmailLoginRes {
  token: string
  userId: string
}

// 用户数据同步
export interface IUserSyncReq {
  userVersions: Array<{
    userId: string
    version: number
  }>
}

export interface IUserSyncRes {
  users: IUserSyncItem[]
}

// 通过用户ID列表同步用户信息（大厂方式）
export interface IUserSyncByIdsReq {
  userIds: string[]
  limit?: number
}

export interface IUserSyncByIdsRes {
  users: IUserSyncItem[]
}

// 获取所有用户响应
export interface IGetAllUsersRes {
  users: IUserSyncItem[]
}

export interface IUserSyncItem {
  userId: string
  nickName: string
  avatar: string
  abstract: string
  phone: string
  email: string
  gender: number
  status: number
  userType: number
  version: number
  createdAt: number
  updatedAt: number
}
