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

// 通知读取游标服务请求和响应类型定义

import type { IDBNotificationReadCursor } from '../../db/notification'

// ===== 通知读取游标操作 =====

/**
 * @description 获取读取游标请求
 */
export interface DBGetReadCursorReq {
  userId: string
  category: string
}

/**
 * @description 获取读取游标响应
 */
export interface DBGetReadCursorRes {
  cursor?: IDBNotificationReadCursor | null
}

/**
 * @description 更新读取游标请求
 */
export interface DBUpdateReadCursorReq {
  userId: string
  category: string
  version: number
  lastReadAt: number
}

/**
 * @description 批量更新读取游标请求
 */
export interface DBBatchUpdateReadCursorsReq {
  cursors: Array<{
    userId: string
    category: string
    version: number
    lastReadAt: number
  }>
}

/**
 * @description 写入或更新游标请求
 */
export interface DBUpsertCursorReq extends Omit<IDBNotificationReadCursor, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 查询用户分类游标请求
 */
export interface DBGetCursorReq {
  userId: string
  category: string
}

/**
 * @description 查询用户分类游标响应
 */
export interface DBGetCursorRes {
  cursor?: IDBNotificationReadCursor | null
}

/**
 * @description 获取用户游标版本映射请求
 */
export interface DBGetVersionMapReq {
  userId: string
  categories?: string[]
}

/**
 * @description 获取用户游标版本映射响应
 */
export interface DBGetVersionMapRes {
  versionMap: Map<string, number>
}

/**
 * @description 获取用户多个分类的游标请求
 */
export interface DBGetCursorsReq {
  userId: string
  categories?: string[]
}

/**
 * @description 获取用户多个分类的游标响应
 */
export interface DBGetCursorsRes {
  cursors: IDBNotificationReadCursor[]
}