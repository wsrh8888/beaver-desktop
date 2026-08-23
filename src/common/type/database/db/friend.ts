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

// 好友表
export interface IDBFriend {
  id?: number
  friendId: string
  sendUserId: string
  revUserId: string
  sendUserNotice?: string
  revUserNotice?: string
  source?: string
  isDeleted?: number
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 好友验证表
export interface IDBFriendVerify {
  id?: number
  verifyId: string
  sendUserId: string
  revUserId: string
  sendStatus?: number // 发起方状态 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  revStatus?: number // 接收方状态 0:未处理 1:已通过 2:已拒绝 3:忽略 4:删除
  message?: string // 附加消息
  source?: string // 添加好友来源：qrcode/search/group/recommend
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 好友同步状态表
export interface IDBFriendSyncStatus {
  id?: number
  friendId: string // 好友ID
  version?: number // 好友关系版本号
  updatedAt?: number
}
