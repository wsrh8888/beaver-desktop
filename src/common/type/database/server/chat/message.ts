/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
export type DBGetChatHistoryRes = IDBChatMessage[]

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
export type DBGetChatMessagesBySeqRangeRes = IDBChatMessage[]
