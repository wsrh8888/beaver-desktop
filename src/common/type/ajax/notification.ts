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

// 通知同步相关接口定义

// 按ID拉取通知事件
export interface IGetNotificationEventsByIdsReq {
  eventIds: string[]
}

export interface INotificationEventItem {
  eventId: string
  eventType: string
  category: string
  version: number
  fromUserId?: string
  targetId?: string
  targetType: string
  payload: string
  priority: number
  status: number
  dedupHash?: string
  createdAt: number
  updatedAt: number
}

export interface IGetNotificationEventsByIdsRes {
  events: INotificationEventItem[]
}

// 按ID拉取通知收件箱
export interface IGetNotificationInboxByIdsReq {
  eventIds: string[]
}

export interface INotificationInboxItem {
  eventId: string
  eventType: string
  category: string
  version: number
  isRead: boolean
  readAt: number
  status: number
  isDeleted: boolean
  silent: boolean
  createdAt: number
  updatedAt: number
}

export interface IGetNotificationInboxByIdsRes {
  inbox: INotificationInboxItem[]
}


// 按分类游标标记已读
export interface IMarkReadByCursorReq {
  category: string // 分类，会话级/业务分类
  toEventId: string // 读到此事件ID
  toVersion: number // 读到此版本
}

export interface IMarkReadByCursorRes {
  affected: number // 成功标记的条数
}

// 按事件ID标记单个通知已读
export interface IMarkReadByEventReq {
  eventId: string // 通知事件ID
}

export interface IMarkReadByEventRes {
  success: boolean
}

// 按事件ID删除单个通知
export interface IDeleteNotificationReq {
  eventId: string // 通知事件ID
}

export interface IDeleteNotificationRes {
  success: boolean
}

// 按分类拉取通知已读游标
export interface IGetNotificationReadCursorsReq {
  categories?: string[]
}

export interface INotificationReadCursorItem {
  category: string
  version: number
  lastReadAt: number
}

export interface IGetNotificationReadCursorsRes {
  cursors: INotificationReadCursorItem[]
}

// 按分类标记所有通知为已读
export interface IMarkReadByCategoryReq {
  category: string // 分类
}

export interface IMarkReadByCategoryRes {
  affected: number // 成功标记的条数
}

// 获取未读汇总
export interface IGetUnreadSummaryReq {
  categories?: string[] // 可选分类过滤
  scenes?: string[] // 可选场景过滤（如消息/系统/群公告等）
}

export interface INotificationCategoryUnreadItem {
  category: string
  unread: number
}

export interface IGetUnreadSummaryRes {
  total: number
  byCat: INotificationCategoryUnreadItem[]
}
