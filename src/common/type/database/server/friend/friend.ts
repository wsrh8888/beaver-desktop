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

// 好友服务请求和响应类型定义

import type { IDBFriend } from '../../db/friend'

/**
 * @description 创建好友关系请求
 */
export interface DBCreateFriendReq extends Omit<IDBFriend, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description upsert好友关系请求
 */
export interface DBUpsertFriendReq extends Omit<IDBFriend, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建好友关系请求
 */
export interface DBBatchCreateFriendsReq {
  friends: Omit<IDBFriend, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 批量获取好友详细信息请求
 */
export interface DBGetFriendDetailsReq {
  userId: string
  friendIds: string[]
}

/**
 * @description 批量获取好友详细信息响应
 */
export type DBGetFriendDetailsRes = IDBFriend[]

/**
 * @description 根据好友关系ID列表批量查询好友信息请求
 */
export interface DBGetFriendsByIdsReq {
  friendIds: string[]
  currentUserId: string
}

/**
 * @description 根据好友关系ID列表批量查询好友信息响应
 */
export type DBGetFriendsByIdsRes = IDBFriend[]

/**
 * @description 根据friendshipIds批量查询本地好友关系请求
 */
export interface DBGetFriendRecordsByIdsReq {
  friendshipIds: string[]
}

/**
 * @description 根据friendshipIds批量查询本地好友关系响应
 */
export type DBGetFriendRecordsByIdsRes = Map<string, IDBFriend>

/**
 * @description 获取好友关系记录请求
 */
export interface DBGetFriendRelationsReq {
  userId: string
  options?: {
    page?: number
    limit?: number
  }
}

/**
 * @description 获取好友关系记录响应
 */
export type DBGetFriendRelationsRes = IDBFriend[]

/**
 * @description 根据版本范围获取好友请求
 */
export interface DBGetFriendsByVerRangeReq {
  userId: string
  startVersion?: number
  endVersion?: number
}

/**
 * @description 根据版本范围获取好友响应
 */
export type DBGetFriendsByVerRangeRes = IDBFriend[]