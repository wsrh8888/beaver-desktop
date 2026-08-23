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

// 用户表
export interface IDBUser {
  id?: number
  userId: string
  nickName: string
  email?: string
  phone?: string
  avatar?: string
  abstract?: string // 个性签名
  gender?: number // 性别：1男 2女 3未知
  userType: number // 1普通用户 2bot 3robot
  status?: number
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 用户同步状态表（客户端本地维护）
export interface IDBUserSyncStatus {
  id?: number
  userId: string // 用户ID
  userVersion: number // 用户资料版本号
  lastSyncTime: number // 最后同步时间戳
  updatedAt?: number
}
