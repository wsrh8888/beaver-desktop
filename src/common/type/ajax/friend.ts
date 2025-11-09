export interface IValidInfo {
  message: string
  avatar: string
  flag: string
  id: string // 验证记录UUID
  nickname: string
  userId: string
  status: number
  createdAt: string
}

export interface IValidListRes {
  count: number
  list: IValidInfo[]
}

export interface IFriendListRes {
  list: IFriendInfo[]
}

export interface ISearchUser {
  keyword: string // 搜索关键词（用户ID或邮箱）
  type?: string // 搜索类型：id(用户ID)/email(邮箱)，默认email
}
// 好友信息请求
export interface IFriendInfoReq {
  friendId: string
}
// 好友信息
export interface IFriendInfo {
  userId: string
  nickname: string
  avatar: string
  abstract: string
  notice: string
  isFriend: boolean
  conversationId: string
  email: string
  source?: string // 好友关系来源：email/qrcode
}

export interface IUserMapInfo {
  avatar: string
  conversationId: string
  isFriend: boolean
  nickname: string
  userId: string
}

// 新增的请求和响应类型
export interface IFriendListReq {
  page?: number
  limit?: number
}

// 数据库服务请求类型
export interface IFriendInfoReq {
  friendId: string
}

export interface IAddFriendReq {
  friendId: string
  verify?: string
  source?: string // 添加好友来源：email(邮箱搜索)/qrcode(扫码)
}

export interface IAddFriendRes {}

export interface ISearchReq {
  phone: string
}

export interface ISearchRes {
  userId: string
  nickname: string
  avatar: string
  abstract: string
  notice: string
  isFriend: boolean
  conversationId: string
}

export interface IDeleteFriendReq {
  friendId: string
}

export interface IDeleteFriendRes {}

export interface IValidStatusReq {
  verifyId: string // 验证记录UUID
  status: number
}

export interface IValidStatusRes {}

export interface IValidListReq {
  page?: number
  limit?: number
}

export interface IFriendVerRangeReq {
  startVersion: number
  endVersion: number
}

export interface IValidVerRangeReq {
  startVersion: number
  endVersion: number
}

export interface INoticeUpdateReq {
  notice: string
  friendId: string
}

export interface INoticeUpdateRes {}

export interface ISearchValidInfoReq {
  friendId: string
}

export interface ISearchValidInfoRes {
  validId: string // 验证记录UUID
}

export interface IResSearchUserInfo {
  userId: string
  nickname: string
  avatar: string
  abstract: string
  notice: string
  isFriend: boolean
  conversationId: string
  email: string
}

// 好友数据同步
export interface IFriendSyncReq {
  fromVersion: number
  toVersion: number
  limit?: number
}

export interface IFriendSyncRes {
  friends: IFriendSyncItem[]
  hasMore: boolean
  nextVersion: number
}

export interface IFriendSyncItem {
  uuid: string // 好友记录UUID
  sendUserId: string
  revUserId: string
  sendUserNotice: string
  revUserNotice: string
  isDeleted: boolean
  version: number
  createAt: number
  updateAt: number
}

// 获取好友用户版本信息（用于数据同步）
export interface IFriendUserVersionsReq {
  offset?: number // 分页偏移量，默认0
  limit?: number // 分页大小，默认100
}

export interface IFriendUserVersionsRes {
  userVersions: IFriendUserVersionItem[]
  total: number // 总好友数
}

export interface IFriendUserVersionItem {
  userId: string // 好友用户ID
  version: number // 好友用户资料版本号
}

// 好友验证数据同步
export interface IFriendVerifySyncReq {
  fromVersion: number
  toVersion: number
  limit?: number
}

export interface IFriendVerifySyncRes {
  friendVerifies: IFriendVerifySyncItem[]
  hasMore: boolean
  nextVersion: number
}

export interface IFriendVerifySyncItem {
  uuid: string // 验证记录UUID
  sendUserId: string // 发送者用户ID
  revUserId: string // 接收者用户ID
  sendStatus: number // 发送方状态：0(未处理)/1(已通过)/2(已拒绝)/3(忽略)/4(删除)
  revStatus: number // 接收方状态：0(未处理)/1(已通过)/2(已拒绝)/3(忽略)/4(删除)
  message: string // 附加消息
  source: string // 添加好友来源：qrcode/search/group/recommend
  version: number // 版本号
  createAt: number // 创建时间戳
  updateAt: number // 更新时间戳
}

// 批量获取好友数据
export interface IGetFriendsListByIdsReq {
  friendIds: string[] // 好友ID列表
}

export interface IGetFriendsListByIdsRes {
  friends: IFriendSyncItem[] // 好友列表
}

// 批量获取好友数据（通过好友关系ID）
export interface IGetFriendsListByFriendshipIdsReq {
  friendshipIds: string[] // 好友关系ID列表
}

export interface IGetFriendsListByFriendshipIdsRes {
  friends: IFriendByFriendshipId[] // 好友列表
}

export interface IFriendByFriendshipId {
  friendshipId: string // 好友关系唯一ID
  sendUserId: string // 发送者用户ID
  revUserId: string // 接收者用户ID
  sendUserNotice: string // 发送者备注
  revUserNotice: string // 接收者备注
  source: string // 添加好友来源
  isDeleted: boolean // 是否已删除
  version: number // 版本号
  createAt: number // 创建时间戳
  updateAt: number // 更新时间戳
}

// 批量获取好友验证数据（通过UUID）
export interface IGetFriendVerifiesListByIdsReq {
  uuids: string[] // 验证记录UUID列表
}

export interface IGetFriendVerifiesListByIdsRes {
  friendVerifies: IFriendVerifyById[] // 好友验证列表
}

export interface IFriendVerifyById {
  uuid: string // 验证记录UUID
  sendUserId: string // 发送者用户ID
  revUserId: string // 接收者用户ID
  sendStatus: number // 发送方状态：0(未处理)/1(已通过)/2(已拒绝)/3(忽略)/4(删除)
  revStatus: number // 接收方状态：0(未处理)/1(已通过)/2(已拒绝)/3(忽略)/4(删除)
  message: string // 附加消息
  source: string // 添加好友来源
  version: number // 版本号
  createAt: number // 创建时间戳
  updateAt: number // 更新时间戳
}
