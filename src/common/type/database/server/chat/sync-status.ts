// 聊天同步状态服务请求和响应类型定义

import type { IDBChatSyncStatus } from '../../db/chat'

// ===== 同步状态操作 =====

// 获取指定模块的同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBGetSyncStatusReq {
  module: string
  conversationId: string
}

// 获取指定模块的同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBGetSyncStatusRes {
  syncStatus?: IDBChatSyncStatus | undefined
}

// 获取消息同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBGetMessageSyncStatusReq {
  conversationId: string
}

// 获取消息同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBGetMessageSyncStatusRes {
  syncStatus?: IDBChatSyncStatus | undefined
}

// 获取会话同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBGetConversationSyncStatusReq {
  conversationId: string
}

// 获取会话同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBGetConversationSyncStatusRes {
  syncStatus?: IDBChatSyncStatus | undefined
}

// 获取用户会话同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBGetUserConversationSyncStatusReq {
  conversationId: string
}

// 获取用户会话同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBGetUserConversationSyncStatusRes {
  syncStatus?: IDBChatSyncStatus | undefined
}

// 批量获取同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBGetSyncStatusesReq {
  module: string
  conversationIds: string[]
}

// 批量获取同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBGetSyncStatusesRes {
  syncStatuses: IDBChatSyncStatus[]
}

// 批量获取会话版本状态请求
/**
 * @description 数据库服务请求
 */
export interface DBGetConversationVersionsReq {
  conversationIds: string[]
}

// 批量获取会话版本状态响应
/**
 * @description 数据库服务请求
 */
export interface DBGetConversationVersionsRes {
  versions: Array<{
    conversationId: string
    version: number
  }>
}

// 批量获取消息版本状态请求
/**
 * @description 数据库服务请求
 */
export interface DBGetMessageVersionsReq {
  conversationIds: string[]
}

// 批量获取消息版本状态响应
/**
 * @description 数据库服务请求
 */
export interface DBGetMessageVersionsRes {
  versions: Array<{
    conversationId: string
    seq: number
  }>
}

// 批量获取用户会话版本状态请求
/**
 * @description 数据库服务请求
 */
export interface DBGetUserConversationVersionsReq {
  conversationIds: string[]
}

// 批量获取用户会话版本状态响应
/**
 * @description 数据库服务请求
 */
export interface DBGetUserConversationVersionsRes {
  versions: Array<{
    conversationId: string
    version: number
  }>
}

// 获取所有同步状态请求
export interface DBGetAllSyncStatusReq { }

// 获取所有同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBGetAllSyncStatusRes {
  syncStatuses: IDBChatSyncStatus[]
}

// 更新或插入同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBUpsertSyncStatusReq {
  module: string
  conversationId: string
  seq?: number
  version?: number
}

// 更新或插入同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBUpsertSyncStatusRes {
  success: boolean
}

// 更新消息同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBUpsertMessageSyncStatusReq {
  conversationId: string
  seq: number
}

// 更新消息同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBUpsertMessageSyncStatusRes {
  success: boolean
}

// 更新会话同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBUpsertConversationSyncStatusReq {
  conversationId: string
  version: number
}

// 更新会话同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBUpsertConversationSyncStatusRes {
  success: boolean
}

// 更新用户会话同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBUpsertUserConversationSyncStatusReq {
  conversationId: string
  version: number
}

// 更新用户会话同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBUpsertUserConversationSyncStatusRes {
  success: boolean
}

// 批量更新同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBBatchUpsertSyncStatusReq {
  statuses: Array<{
    module: string
    conversationId: string
    seq?: number
    version?: number
  }>
}

// 批量更新同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBBatchUpsertSyncStatusRes {
  success: boolean
}

// 删除同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBDeleteSyncStatusReq {
  module: string
  conversationId: string
}

// 删除同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBDeleteSyncStatusRes {
  success: boolean
}

// 批量删除同步状态请求
/**
 * @description 数据库服务请求
 */
export interface DBBatchDeleteSyncStatusReq {
  module: string
  conversationIds: string[]
}

// 批量删除同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBBatchDeleteSyncStatusRes {
  success: boolean
}

// 获取需要同步消息的会话请求
/**
 * @description 数据库服务请求
 */
export interface DBGetConversationsNeedMessageSyncReq {
  serverSeqs: Record<string, number>
}

// 获取需要同步消息的会话响应
/**
 * @description 数据库服务请求
 */
export interface DBGetConversationsNeedMessageSyncRes {
  conversationIds: string[]
}

// 清空所有同步状态请求
export interface DBClearAllSyncStatusReq { }

// 清空所有同步状态响应
/**
 * @description 数据库服务请求
 */
export interface DBClearAllSyncStatusRes {
  success: boolean
}
