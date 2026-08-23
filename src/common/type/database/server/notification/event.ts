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

// 通知事件服务请求和响应类型定义

import type { IDBNotificationEvent } from '../../db/notification'

// ===== 通知事件操作 =====

/**
 * @description 创建通知事件请求
 */
export interface DBCreateNotificationEventReq extends Omit<IDBNotificationEvent, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建通知事件请求
 */
export interface DBBatchCreateNotificationEventsReq {
  events: Omit<IDBNotificationEvent, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 获取通知事件请求
 */
export interface DBGetNotificationEventReq {
  eventId: string
}

/**
 * @description 获取通知事件响应
 */
export interface DBGetNotificationEventRes {
  event?: IDBNotificationEvent | null
}

/**
 * @description 批量获取通知事件请求
 */
export interface DBGetNotificationEventsReq {
  eventIds: string[]
}

/**
 * @description 批量获取通知事件响应
 */
export type DBGetNotificationEventsRes = IDBNotificationEvent[]

/**
 * @description 更新通知事件状态请求
 */
export interface DBUpdateNotificationEventStatusReq {
  eventId: string
  status: number
}

/**
 * @description 按版本增量拉取事件请求
 */
export interface DBGetEventsAfterVersionReq {
  version: number
  limit?: number
}

/**
 * @description 按版本增量拉取事件响应
 */
export interface DBGetEventsAfterVersionRes {
  events: IDBNotificationEvent[]
}

/**
 * @description 获取指定事件ID的本地版本映射请求
 */
export interface DBGetVersionMapByIdsReq {
  eventIds: string[]
}

/**
 * @description 获取指定事件ID的本地版本映射响应
 */
export interface DBGetVersionMapByIdsRes {
  versionMap: Map<string, number>
}