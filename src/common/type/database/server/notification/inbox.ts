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