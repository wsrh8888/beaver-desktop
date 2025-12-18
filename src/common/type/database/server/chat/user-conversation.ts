// 用户会话服务请求和响应类型定义

import type { IDBChatUserConversation } from '../../db/chat'

// ===== 用户会话操作 =====

// 创建单个用户会话关系请求
/**
 * @description 数据库服务请求
 */
export interface DBCreateUserConversationReq {
  userConversationData: any
}

// 创建单个用户会话关系响应
/**
 * @description 数据库服务请求
 */
export interface DBCreateUserConversationRes {
  success: boolean
}

// 批量创建用户会话关系请求
/**
 * @description 数据库服务请求
 */
export interface DBBatchCreateUserConversationsReq {
  userConversations: any[]
}

// 批量创建用户会话关系响应
/**
 * @description 数据库服务请求
 */
export interface DBBatchCreateUserConversationsRes {
  success: boolean
}

// 更新已读序列号请求
/**
 * @description 数据库服务请求
 */
export interface DBUpdateReadSeqReq {
  userId: string
  conversationId: string
  readSeq: number
}

// 更新已读序列号响应
/**
 * @description 数据库服务请求
 */
export interface DBUpdateReadSeqRes {
  success: boolean
}

// 更新会话设置请求
/**
 * @description 数据库服务请求
 */
export interface DBUpdateSettingsReq {
  userId: string
  conversationId: string
  settings: {
    isHidden?: number
    isPinned?: number
    isMuted?: number
  }
}

// 更新会话设置响应
/**
 * @description 数据库服务请求
 */
export interface DBUpdateSettingsRes {
  success: boolean
}

// 获取用户会话列表请求
/**
 * @description 数据库服务请求
 */
export interface DBGetUserConversationsReq {
  userId: string
  params: {
    page?: number
    limit?: number
    offset?: number
  }
}

// 获取用户会话列表响应
/**
 * @description 数据库服务请求
 */
export interface DBGetUserConversationsRes {
  conversations: IDBChatUserConversation[]
}

// 获取所有用户会话请求
/**
 * @description 数据库服务请求
 */
export interface DBGetAllUserConversationsReq {
  userId: string
}

// 获取所有用户会话响应
/**
 * @description 数据库服务请求
 */
export interface DBGetAllUserConversationsRes {
  conversations: IDBChatUserConversation[]
}

// 根据ID列表获取用户会话请求
/**
 * @description 数据库服务请求
 */
export interface DBGetUserConversationsByIdsReq {
  userId: string
  conversationIds: string[]
}

// 根据ID列表获取用户会话响应
/**
 * @description 数据库服务请求
 */
export interface DBGetUserConversationsByIdsRes {
  conversations: IDBChatUserConversation[]
}

// 获取会话信息请求
/**
 * @description 数据库服务请求
 */
export interface DBGetConversationInfoReq {
  header: any
  params: any
}

// 获取会话信息响应
/**
 * @description 数据库服务请求
 */
export interface DBGetConversationInfoRes {
  conversationInfo?: any
}

// 根据版本范围获取会话请求
/**
 * @description 数据库服务请求
 */
export interface DBGetChatConversationsByVerRangeReq {
  header: any
  params: any
}

// 根据版本范围获取会话响应
/**
 * @description 数据库服务请求
 */
export interface DBGetChatConversationsByVerRangeRes {
  conversations: IDBChatUserConversation[]
}
