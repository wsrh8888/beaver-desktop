/**
 * @description: 数据库分页相关类型定义 - 简洁版本
 */

/**
 * @description: 分页查询参数
 */
export interface PaginationParams {
  /** 页码，从0开始 */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 排序字段 */
  sortBy?: string
  /** 排序方向 */
  sortOrder?: 'ASC' | 'DESC'
  /** 搜索关键词 */
  keyword?: string
  /** 过滤条件 */
  where?: Record<string, any>
}

/**
 * @description: 分页返回结果 - 最简版本
 */
export interface PaginationResult<T = any> {
  /** 数据列表 */
  data: T[]
  /** 总记录数 */
  totalCount: number
}

/**
 * @description: 数据库表类型枚举 - 核心业务表
 */
export enum DatabaseTable {
  /** 用户表 */
  USERS = 'users',
  /** 好友表 */
  FRIENDS = 'friends',
  /** 好友验证表 */
  FRIEND_VERIFIES = 'friend_verifies',
  /** 群组表 */
  GROUPS = 'groups',
  /** 群成员表 */
  GROUP_MEMBERS = 'group_members',
  /** 聊天消息表 */
  CHAT_MESSAGES = 'chat_messages',
  /** 会话表 */
  CONVERSATIONS = 'conversations',
  /** 动态表 */
  MOMENTS = 'moments',
  /** 文件表 */
  FILES = 'files',
  /** 反馈表 */
  FEEDBACK = 'feedback',
}

/**
 * @description: 数据库操作类型
 */
export enum DatabaseOperation {
  /** 获取列表（分页） */
  GET_LIST = 'get_list',
  /** 获取总数 */
  GET_COUNT = 'get_count',
  /** 根据ID获取单条记录 */
  GET_BY_ID = 'get_by_id',
  /** 创建记录 */
  CREATE = 'create',
  /** 更新记录 */
  UPDATE = 'update',
  /** 删除记录 */
  DELETE = 'delete',
}

/**
 * @description: 数据库命令参数
 */
export interface DatabaseCommandParams {
  /** 表名 */
  table: DatabaseTable
  /** 操作类型 */
  operation: DatabaseOperation
  /** 分页参数 */
  pagination?: PaginationParams
  /** 查询条件 */
  where?: Record<string, any>
  /** 数据 */
  data?: any
  /** ID */
  id?: string | number
}

/**
 * @description: 用户数据接口
 */
export interface IDataBaseUserModel {
  uuid: string
  nickName: string
  email: string
  phone: string
  avatar: string
  abstract: string
  gender: number
  status: number
  lastLoginIp: string
  version: number
  createdAt: number
  updatedAt: number
}

/**
 * @description: 好友数据接口
 */
export interface IFriend {
  id?: number
  sendUserId: string
  revUserId: string
  sendUserNotice?: string
  revUserNotice?: string
  isDeleted?: number
  createdAt?: number
  updatedAt?: number
}

/**
 * @description: 群组数据接口
 */
export interface IGroup {
  id?: number
  groupId: string
  groupName: string
  groupAvatar?: string
  groupDescription?: string
  groupOwner: string
  groupType?: number
  status?: number
  createdAt?: number
  updatedAt?: number
}

/**
 * @description: 群成员数据接口
 */
export interface IGroupMember {
  id?: number
  groupId: string
  userId: string
  role?: number
  status?: number
  joinedAt?: number
  createdAt?: number
  updatedAt?: number
}

/**
 * @description: 聊天消息数据接口
 */
export interface IChatMessage {
  id?: number
  messageId: string
  conversationId: string
  conversationType: number // 1=私聊 2=群聊 3=系统会话
  sendUserId: string
  msgType: number
  msgPreview?: string
  msg: string
  seq?: number
  createdAt?: number
  updatedAt?: number
}

/**
 * @description: 会话数据接口
 */
export interface IConversation {
  id?: number
  conversationId: string
  userId: string
  lastReadMsgId?: number
  createdAt?: number
  updatedAt?: number
}

/**
 * @description: 同步游标数据接口
 */
export interface ISyncCursor {
  id?: number
  userId: string
  deviceId: string
  dataType: string
  conversationId?: string
  lastSeq?: number
  syncStatus?: string
  createdAt?: number
  updatedAt?: number
}

//  class 实现一个ISyncCursor的类

export interface IDatasyncBase {
  /**
   * 检查并同步
   */
  checkAndSync(): Promise<void>
  /**
   * 同步
   */
  sync(_fromSeq: number, _toSeq: number): Promise<void>

}
