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

// 表情服务请求和响应类型定义

import type { IDBEmoji } from '../../db/emoji'

// ===== 表情操作 =====

/**
 * @description 创建表情请求
 */
export interface DBCreateEmojiReq extends Omit<IDBEmoji, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建表情请求
 */
export interface DBBatchCreateEmojisReq {
  emojiList: Omit<IDBEmoji, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 根据ID列表获取表情请求
 */
export interface DBGetEmojisByIdsReq {
  ids: string[]
}

/**
 * @description 根据ID列表获取表情响应
 */
export type DBGetEmojisByIdsRes = Map<string, IDBEmoji>

/**
 * @description 获取所有表情请求
 */
export interface DBGetAllEmojisReq {}

/**
 * @description 获取所有表情响应
 */
export type DBGetAllEmojisRes = IDBEmoji[]

/**
 * @description 根据ID获取单个表情请求
 */
export interface DBGetEmojiByIdReq {
  id: string
}

/**
 * @description 根据ID获取单个表情响应
 */
export type DBGetEmojiByIdRes = IDBEmoji | null
