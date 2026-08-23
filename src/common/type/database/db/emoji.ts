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

// 表情表
export interface IDBEmoji {
  id?: number
  emojiId: string
  fileKey: string
  title: string
  status?: number // 状态：1=正常 2=审核中 3=违规禁用
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 用户收藏的表情表
export interface IDBEmojiCollect {
  id?: number
  emojiCollectId: string
  userId: string
  emojiId: string // 表情ID
  isDeleted?: number // 是否已删除（软删除）：0=未删除 1=已删除
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 表情包表
export interface IDBEmojiPackage {
  id?: number
  packageId: string
  title: string
  coverFile?: string
  userId: string
  description?: string
  type: string // 类型：official-官方，user-用户自定义
  status?: number // 状态：1=正常 2=审核中 3=违规禁用
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 表情包与表情的多对多关联表
export interface IDBEmojiPackageEmoji {
  id?: number
  relationId: string
  packageId: string // 表情包ID
  emojiId: string // 表情ID
  sortOrder?: number // 在表情包中的排序
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 用户收藏的表情包表
export interface IDBEmojiPackageCollect {
  id?: number
  packageCollectId: string
  userId: string
  packageId: string // 表情包ID
  isDeleted?: number // 是否已删除（软删除）：0=未删除 1=已删除
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}
