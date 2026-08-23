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

// 表情包收藏服务请求和响应类型定义

import type { IDBEmojiPackageCollect } from '../../db/emoji'

// ===== 表情包收藏操作 =====

/**
 * @description 创建表情包收藏请求
 */
export interface DBCreatePackageCollectReq extends Omit<IDBEmojiPackageCollect, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建表情包收藏请求
 */
export interface DBBatchCreatePackageCollectsReq {
  collects: Omit<IDBEmojiPackageCollect, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 根据用户ID获取收藏的表情包请求
 */
export interface DBGetCollectsByUserIdReq {
  userId: string
}

/**
 * @description 根据用户ID获取收藏的表情包响应
 */
export interface DBGetCollectsByUserIdRes {
  collects: IDBEmojiPackageCollect[]
}

/**
 * @description 根据ID列表获取表情包收藏请求
 */
export interface DBGetPackageCollectsByIdsReq {
  ids: string[]
}

/**
 * @description 根据ID列表获取表情包收藏响应
 */
export type DBGetPackageCollectsByIdsRes = Map<string, IDBEmojiPackageCollect>

/**
 * @description 根据用户ID获取用户的所有表情包收藏请求
 */
export interface DBGetPackageCollectsByUserIdReq {
  userId: string
}

/**
 * @description 根据用户ID获取用户的所有表情包收藏响应
 */
export type DBGetPackageCollectsByUserIdRes = IDBEmojiPackageCollect[]

/**
 * @description 根据ID获取单个表情包收藏请求
 */
export interface DBGetPackageCollectByIdReq {
  packageCollectId: string
}

/**
 * @description 根据ID获取单个表情包收藏响应
 */
export type DBGetPackageCollectByIdRes = IDBEmojiPackageCollect | null

/**
 * @description 删除表情包收藏请求
 */
export interface DBDeletePackageCollectReq {
  userId: string
  packageId: string
}
