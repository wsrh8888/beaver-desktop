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

// 表情包服务请求和响应类型定义

import type { IDBEmojiPackage } from '../../db/emoji'

// ===== 表情包操作 =====

/**
 * @description 创建表情包请求
 */
export interface DBCreateEmojiPackageReq extends Omit<IDBEmojiPackage, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建表情包请求
 */
export interface DBBatchCreateEmojiPackagesReq {
  packageList: Omit<IDBEmojiPackage, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 根据ID列表获取表情包请求
 */
export interface DBGetEmojiPackagesByIdsReq {
  ids: string[]
}

/**
 * @description 根据ID列表获取表情包响应
 */
export type DBGetEmojiPackagesByIdsRes = Map<string, IDBEmojiPackage>

/**
 * @description 获取所有表情包请求
 */
export interface DBGetAllEmojiPackagesReq {}

/**
 * @description 获取所有表情包响应
 */
export type DBGetAllEmojiPackagesRes = IDBEmojiPackage[]

/**
 * @description 根据ID获取单个表情包请求
 */
export interface DBGetEmojiPackageByIdReq {
  id: string
}

/**
 * @description 根据ID获取单个表情包响应
 */
export type DBGetEmojiPackageByIdRes = IDBEmojiPackage | null

/**
 * @description 更新表情包请求
 */
export interface DBUpdateEmojiPackageReq {
  packageId: string
  updateData: Partial<Omit<IDBEmojiPackage, 'id' | 'createdAt'>>
}

/**
 * @description 根据用户ID获取用户创建的表情包请求
 */
export interface DBGetPackagesByUserIdReq {
  userId: string
}

/**
 * @description 根据用户ID获取用户创建的表情包响应
 */
export type DBGetPackagesByUserIdRes = IDBEmojiPackage[]

/**
 * @description 删除表情包请求
 */
export interface DBDeleteEmojiPackageReq {
  packageId: string
}

/**
 * @description 根据内部自增ID查询请求
 */
export interface DBGetPackageByAutoIdReq {
  id: number
}

/**
 * @description 根据内部自增ID查询响应
 */
export type DBGetPackageByAutoIdRes = IDBEmojiPackage | null