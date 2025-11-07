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

export interface IGetSyncCursorReq {
  dataType: EDataType // users/friends/groups/group_members/group_join_requests/chat_messages/chat_datasync/chat_conversation_settings
}

// 获取同步游标响应
export interface IGetSyncCursorRes {
  lastSeq: number // 服务端最新版本号
}

// 更新同步游标请求
export interface IUpdateSyncCursorReq {
  dataType: string
  lastSeq: number // 最后同步的序列号（消息用）或版本号（基础数据用）
  conversationId?: string
}

// 更新同步游标响应
export interface IUpdateSyncCursorRes {
  message: string
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

// 获取所有群组同步信息请求
export interface IGetSyncAllGroupsReq {
  since?: number // 从这个时间戳之后开始同步，不传则同步所有
}

// 获取所有群组同步信息响应
export interface IGetSyncAllGroupsRes {
  groupVersions: IGroupVersionItem[]
  serverTimestamp: number // 服务端处理时间戳
}

// 群组版本信息
export interface IGroupVersionItem {
  groupId: string // 群组ID
  groupVersion: number // 群资料版本
  memberVersion: number // 群成员版本
  requestVersion: number // 入群申请版本
}
