export enum EDataType {
  USERS = 'users',
  FRIENDS = 'friends',
  FRIEND_VERIFY = 'friend_verify',
  GROUPS = 'groups',
  GROUP_MEMBERS = 'group_members', // 群成员表 - 使用version
  GROUP_JOIN_REQUESTS = 'group_join_requests', // 入群申请表 - 使用version
  // 聊天模块的细分数据类型
  CHAT_MESSAGES = 'chat_messages', // 消息表 - 使用seq
  CHAT_DATASYNC = 'chat_datasync', // 数据同步表 - 使用version
  CHAT_CONVERSATION_SETTINGS = 'chat_conversation_settings', // 会话设置表 - 使用version
}

// 数据同步状态请求
export interface IDataSyncStatusReq {}

// 数据同步状态响应
export interface IDataSyncStatusRes {
  initialized: boolean
  sync: Record<string, any>
  cache: Record<string, any>
  heartbeat: {
    status: string
    retryCount: number
  } | null
}

// 手动同步请求
export interface IManualSyncReq {
  dataType?: string
  conversationId?: string
}

// 手动同步响应
export interface IManualSyncRes {
  success: boolean
  results?: Record<string, boolean>
  error?: string
}

// 获取所有用户同步信息请求
export interface IGetSyncAllUsersReq {
  type?: string // 类型：friends/group/all，不传或为空则同步所有相关用户
  since?: number // 从这个时间戳之后开始同步，不传则同步所有
}

// 获取所有用户同步信息响应
export interface IGetSyncAllUsersRes {
  userVersions: IUserVersionItem[]
  serverTimestamp: number // 服务端处理时间戳
}

// 用户版本信息
export interface IUserVersionItem {
  userId: string // 用户ID
  version: number // 最新版本号
}

// 获取群组信息同步请求
export interface IGetSyncGroupInfoReq {
  since?: number // 从这个版本号之后开始同步，不传则同步所有
}

// 获取群组信息同步响应
export interface IGetSyncGroupInfoRes {
  groupVersions: IGroupInfoVersionItem[]
  serverTimestamp: number // 服务端处理时间戳
}

// 群组信息版本信息
export interface IGroupInfoVersionItem {
  groupId: string // 群组ID
  version: number // 群资料版本
}

// 获取群成员同步请求
export interface IGetSyncGroupMembersReq {
  since?: number // 从这个版本号之后开始同步，不传则同步所有
}

// 获取群成员同步响应
export interface IGetSyncGroupMembersRes {
  groupVersions: IGroupMembersVersionItem[]
  serverTimestamp: number // 服务端处理时间戳
}

// 群成员版本信息
export interface IGroupMembersVersionItem {
  groupId: string // 群组ID
  version: number // 群成员版本
}

// 获取入群申请同步请求
export interface IGetSyncGroupRequestsReq {
  since?: number // 从这个版本号之后开始同步，不传则同步所有
}

// 获取入群申请同步响应
export interface IGetSyncGroupRequestsRes {
  groupVersions: IGroupRequestsVersionItem[]
  serverTimestamp: number // 服务端处理时间戳
}

// 入群申请版本信息
export interface IGroupRequestsVersionItem {
  groupId: string // 群组ID
  version: number // 入群申请版本
}

// 获取聊天消息同步请求
export interface IGetSyncChatMessagesReq {
  since?: number // 从这个序列号之后开始同步，不传则同步所有
}

// 获取聊天消息同步响应
export interface IGetSyncChatMessagesRes {
  messageVersions: IChatMessageVersionItem[] // 变更的消息版本摘要
  serverTimestamp: number // 服务端处理时间戳
}

// 聊天消息版本信息
export interface IChatMessageVersionItem {
  conversationId: string // 会话ID
  seq: number // 会话最新消息序列号
}

// 获取会话元信息同步请求
export interface IGetSyncChatConversationsReq {
  since?: number // 从这个版本号之后开始同步，不传则同步所有
}

// 获取会话元信息同步响应
export interface IGetSyncChatConversationsRes {
  conversationVersions: IChatConversationVersionItem[] // 变更的会话版本摘要
  serverTimestamp: number // 服务端处理时间戳
}

// 会话元信息版本信息
export interface IChatConversationVersionItem {
  conversationId: string // 会话ID
  version: number // 会话版本号
}

// 获取用户会话设置同步请求
export interface IGetSyncChatUserConversationsReq {
  since?: number // 从这个版本号之后开始同步，不传则同步所有
}

// 获取用户会话设置同步响应
export interface IGetSyncChatUserConversationsRes {
  userConversationVersions: IChatUserConversationVersionItem[] // 变更的用户会话设置版本摘要
  serverTimestamp: number // 服务端处理时间戳
}

// 用户会话设置版本信息
export interface IChatUserConversationVersionItem {
  conversationId: string // 会话ID
  version: number // 用户会话设置版本号
}

// 获取好友同步请求
export interface IGetSyncFriendsReq {
  since?: number // 从这个版本号之后开始同步，不传则同步所有
}

// 获取好友同步响应
export interface IGetSyncFriendsRes {
  friendVersions: IFriendVersionItem[] // 变更的好友版本摘要
  serverTimestamp: number // 服务端处理时间戳
}

// 好友版本信息
export interface IFriendVersionItem {
  id: string // 好友关系唯一ID
  version: number // 好友关系版本号
}

// 获取好友验证同步请求
export interface IGetSyncFriendVerifiesReq {
  since?: number // 从这个版本号之后开始同步，不传则同步所有
}

// 获取好友验证同步响应
export interface IGetSyncFriendVerifiesRes {
  friendVerifyVersions: IFriendVerifyVersionItem[] // 变更的好友验证版本摘要
  serverTimestamp: number // 服务端处理时间戳
}

// 好友验证版本信息
export interface IFriendVerifyVersionItem {
  verifyId: string // 验证记录ID
  version: number // 验证记录版本号
}

// 获取表情同步请求
export interface IGetSyncEmojisReq {
  since?: number // 从这个时间戳之后开始同步，不传则同步所有
}

// 获取表情同步响应
export interface IGetSyncEmojisRes {
  emojiVersions: IEmojiVersionItem[] // 表情基础数据摘要
  serverTimestamp: number // 服务端处理时间戳
}

// 表情版本信息
export interface IEmojiVersionItem {
  emojiId: string // 表情ID
  version: number // 表情版本号
}

// 获取表情收藏同步请求
export interface IGetSyncEmojiCollectsReq {
  since?: number // 从这个时间戳之后开始同步，不传则同步所有
}

// 获取表情收藏同步响应
export interface IGetSyncEmojiCollectsRes {
  emojiCollectVersions: IEmojiCollectVersionItem[] // 用户收藏的表情变更摘要
  emojiPackageCollectVersions: IEmojiPackageCollectVersionItem[] // 用户收藏的表情包变更摘要
  emojiPackageVersions: IEmojiPackageVersionItem[] // 表情包数据变更摘要
  emojiPackageContentVersions: IEmojiPackageContentVersionItem[] // 表情包内容变更摘要
  serverTimestamp: number // 服务端处理时间戳
}

// 表情收藏版本信息
export interface IEmojiCollectVersionItem {
  emojiCollectId: string // 表情收藏记录ID
  version: number // 收藏版本号
}

// 表情包收藏版本信息
export interface IEmojiPackageCollectVersionItem {
  packageCollectId: string // 表情包收藏记录ID
  version: number // 收藏版本号
}

// 表情包版本信息
export interface IEmojiPackageVersionItem {
  packageId: string // 表情包ID
  version: number // 表情包版本号
}

// 表情包内容版本信息
export interface IEmojiPackageContentVersionItem {
  packageId: string // 表情包ID
  version: number // 表情包内容版本号
}
