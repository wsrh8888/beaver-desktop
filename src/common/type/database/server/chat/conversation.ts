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