// Business层类型定义 - 好友相关

/**
 * 获取好友列表请求
 */
export interface GetFriendsListReq {
  page?: number
  limit?: number
}

/**
 * 好友信息响应
 */
export interface FriendInfo {
  userId: string
  nickname: string
  avatar?: string
  notice?: string // 备注
  source?: string // 来源
}
