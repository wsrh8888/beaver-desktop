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