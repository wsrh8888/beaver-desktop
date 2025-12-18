// 消息服务请求和响应类型定义


// ===== 消息操作 =====

import type { IDBChatMessage, SendStatus } from '../../db/chat'

/**
 * @description 创建单条消息请求
 */
export interface DBCreateMessageReq extends Omit<IDBChatMessage, 'id' | 'createdAt' | 'updatedAt'> {
  // 继承 IDBChatMessage，但排除自动生成字段
}

/**
 * @description 创建单条消息响应
 */
export interface DBCreateMessageRes {
  // 写入操作无返回值
}

/**
 * @description 批量创建消息请求
 */
export interface DBBatchCreateMessagesReq {
  messages: Omit<IDBChatMessage, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 批量创建消息响应
 */
export interface DBBatchCreateMessagesRes {
  // 写入操作无返回值
}

/**
 * @description 批量更新消息发送状态请求
 */
export interface DBBatchUpdateSendStatusReq {
  messageIds: string[]
  sendStatus: SendStatus
  seqMap?: Map<string, number>
}

/**
 * @description 批量更新消息发送状态响应
 */
export interface DBBatchUpdateSendStatusRes {
  // 写入操作无返回值
}

/**
 * @description 获取会话的历史消息请求
 */
export interface DBGetChatHistoryReq {
  conversationId: string
  seq?: number
  limit?: number
}

/**
 * @description 获取会话的历史消息响应
 */
export interface DBGetChatHistoryRes {
  messages: IDBChatMessage[]
}

/**
 * @description 按序列号范围获取消息请求
 */
export interface DBGetChatMessagesBySeqRangeReq {
  conversationId: string
  startSeq: number
  endSeq: number
}

/**
 * @description 按序列号范围获取消息响应
 */
export interface DBGetChatMessagesBySeqRangeRes {
  messages: IDBChatMessage[]
}
