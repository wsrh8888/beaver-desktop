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

// 表情包表情关联服务请求和响应类型定义

import type { IDBEmojiPackageEmoji } from '../../db/emoji'

// ===== 表情包表情关联操作 =====

/**
 * @description 创建表情包表情关联请求
 */
export interface DBCreatePackageEmojiReq extends Omit<IDBEmojiPackageEmoji, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建表情包表情关联请求
 */
export interface DBBatchCreatePackageEmojisReq {
  relations: Omit<IDBEmojiPackageEmoji, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 根据表情包ID获取表情列表请求
 */
export interface DBGetEmojisByPackageIdReq {
  packageId: string
}

/**
 * @description 根据表情包ID获取表情列表响应
 */
export type DBGetEmojisByPackageIdRes = IDBEmojiPackageEmoji[]

/**
 * @description 根据表情包ID列表获取表情关联数据请求
 */
export interface DBGetEmojisByPackageIdsReq {
  packageIds: string[]
}

/**
 * @description 根据表情包ID列表获取表情关联数据响应
 */
export type DBGetEmojisByPackageIdsRes = Map<string, IDBEmojiPackageEmoji[]>

/**
 * @description 根据表情ID获取所属的表情包请求
 */
export interface DBGetPackagesByEmojiIdReq {
  emojiId: string
}

/**
 * @description 根据表情ID获取所属的表情包响应
 */
export type DBGetPackagesByEmojiIdRes = IDBEmojiPackageEmoji[]

/**
 * @description 删除表情包中的表情请求
 */
export interface DBDeleteByPackageIdAndEmojiIdReq {
  packageId: string
  emojiId: string
}

/**
 * @description 删除表情包中的所有表情请求
 */
export interface DBDeleteByPackageIdReq {
  packageId: string
}
