// 好友表
export interface IDBFriend {
  id?: number
  uuid: string
  sendUserId: string
  revUserId: string
  sendUserNotice?: string
  revUserNotice?: string
  source?: string
  isDeleted?: number
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 好友验证表
export interface IDBFriendVerify {
  id?: number
  uuid: string
  sendUserId: string
  revUserId: string
  sendStatus?: number // 发起方状态 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  revStatus?: number // 接收方状态 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  message?: string // 附加消息
  source?: string // 添加好友来源：qrcode/search/group/recommend
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}
