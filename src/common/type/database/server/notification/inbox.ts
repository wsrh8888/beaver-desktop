// 通知收件箱服务请求和响应类型定义

import type { IDBNotificationInbox } from '../../db/notification'

// ===== 通知收件箱操作 =====

/**
 * @description 添加通知到收件箱请求
 */
export interface DBAddToInboxReq extends Omit<IDBNotificationInbox, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量添加通知到收件箱请求
 */
export interface DBBatchAddToInboxReq {
  inboxes: Omit<IDBNotificationInbox, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 获取用户收件箱请求
 */
export interface DBGetUserInboxReq {
  userId: string
  category?: string
  isRead?: number
  limit?: number
}

/**
 * @description 获取用户收件箱响应
 */
export interface DBGetUserInboxRes {
  inboxItems: IDBNotificationInbox[]
}

/**
 * @description 标记已读请求
 */
export interface DBMarkAsReadReq {
  userId: string
  eventIds: string[]
}

/**
 * @description 删除收件箱项目请求
 */
export interface DBDeleteInboxItemReq {
  userId: string
  eventId: string
}

/**
 * @description 标记指定事件为已读请求
 */
export interface DBMarkReadByEventIdsReq {
  userId: string
  eventIds: string[]
  readAt?: number
}

/**
 * @description 按版本增量拉取用户收件箱请求
 */
export interface DBGetInboxesAfterVersionReq {
  userId: string
  version: number
  limit?: number
}

/**
 * @description 按版本增量拉取用户收件箱响应
 */
export interface DBGetInboxesAfterVersionRes {
  inboxes: IDBNotificationInbox[]
}

/**
 * @description 获取指定事件ID的收件箱本地版本映射请求
 */
export interface DBGetVersionMapByEventIdsReq {
  userId: string
  eventIds: string[]
}

/**
 * @description 获取指定事件ID的收件箱本地版本映射响应
 */
export type DBGetVersionMapByEventIdsRes = Map<string, number>

/**
 * @description 根据事件ID列表获取收件箱记录请求
 */
export interface DBGetByEventIdsReq {
  userId: string
  eventIds: string[]
}

/**
 * @description 根据事件ID列表获取收件箱记录响应
 */
export interface DBGetByEventIdsRes {
  inboxes: IDBNotificationInbox[]
}

/**
 * @description 获取指定时间之后指定分类的未读数量请求
 */
export interface DBGetUnreadCountAfterTimeReq {
  userId: string
  category: string
  afterTime: number
}

/**
 * @description 获取指定时间之后指定分类的未读数量响应
 */
export interface DBGetUnreadCountAfterTimeRes {
  unreadCount: number
}

/**
 * @description 获取基础未读统计请求
 */
export interface DBGetBasicUnreadByCategoriesReq {
  userId: string
  categories?: string[]
}

/**
 * @description 获取基础未读统计响应
 */
export interface DBGetBasicUnreadByCategoriesRes {
  unreadStats: Array<{ category: string, unread: number }>
}

/**
 * @description 获取用户指定分类的通知列表请求
 */
export interface DBGetByUserIdAndCategoriesReq {
  userId: string
  categories?: string[]
  limit?: number
}

/**
 * @description 获取用户指定分类的通知列表响应
 */
export interface DBGetByUserIdAndCategoriesRes {
  inboxes: IDBNotificationInbox[]
}