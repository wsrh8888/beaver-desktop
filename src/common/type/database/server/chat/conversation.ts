// 聊天会话服务请求和响应类型定义

import type { IDBChatConversationMeta } from '../../db/chat'

// ===== 会话操作 =====

/**
 * @description 创建单个会话请求
 */
export interface DBCreateConversationReq extends Omit<IDBChatConversationMeta, 'id' | 'createdAt' | 'updatedAt'> {
  // 继承 IDBChatConversationMeta，但排除自动生成字段
}

/**
 * @description upsert单个会话请求
 */
export interface DBUpsertConversationReq extends Omit<IDBChatConversationMeta, 'id' | 'createdAt' | 'updatedAt'> {
  // 继承 IDBChatConversationMeta，但排除自动生成字段
}

/**
 * @description 批量创建会话请求
 */
export interface DBBatchCreateConversationsReq {
  conversations: Omit<IDBChatConversationMeta, 'id'>[]
}

/**
 * @description 获取所有会话请求
 */
export interface DBGetAllConversationsReq {
  page?: number
  limit?: number
}

/**
 * @description 获取所有会话响应
 */
export type DBGetAllConversationsRes = IDBChatConversationMeta[]

/**
 * @description 根据会话ID列表批量获取会话请求
 */
export interface DBGetConversationsByIdsReq {
  conversationIds: string[]
}

/**
 * @description 根据会话ID列表批量获取会话响应
 */
export type DBGetConversationsByIdsRes = IDBChatConversationMeta[]

/**
 * @description 根据会话ID获取单个会话请求
 */
export interface DBGetConversationByIdReq {
  conversationId: string
}

/**
 * @description 根据会话ID获取单个会话响应
 */
export interface DBGetConversationByIdRes {
  conversation?: IDBChatConversationMeta
}

/**
 * @description 根据类型获取会话请求
 */
export interface DBGetConversationsByTypeReq {
  type: number
}

/**
 * @description 根据类型获取会话响应
 */
export type DBGetConversationsByTypeRes = IDBChatConversationMeta[]

/**
 * @description 更新会话的最后消息请求
 */
export interface DBUpdateLastMessageReq {
  conversationId: string
  lastMessage: string
  maxSeq?: number
}