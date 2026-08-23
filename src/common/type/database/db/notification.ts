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

// 通知相关表（与服务端 notification_models 保持一致）
export interface IDBNotificationEvent {
  id?: number
  eventId: string
  eventType: string
  category: string
  version?: number
  fromUserId?: string
  targetId?: string
  targetType: string
  payload?: string
  priority?: number
  status?: number
  dedupHash?: string
  createdAt?: number
  updatedAt?: number
}

export interface IDBNotificationInbox {
  id?: number
  userId: string
  eventId: string
  eventType: string
  category: string
  version?: number
  isRead?: number
  readAt?: number
  status?: number
  isDeleted?: number
  silent?: number
  createdAt?: number
  updatedAt?: number
}

export interface IDBNotificationReadCursor {
  id?: number
  userId: string
  category: string
  version?: number
  lastReadAt?: number
  createdAt?: number
  updatedAt?: number
}

