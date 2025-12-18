// 通知读取游标服务请求和响应类型定义

import type { IDBNotificationReadCursor } from '../../db/notification'

// ===== 通知读取游标操作 =====

/**
 * @description 获取读取游标请求
 */
export interface DBGetReadCursorReq {
  userId: string
  category: string
}

/**
 * @description 获取读取游标响应
 */
export interface DBGetReadCursorRes {
  cursor?: IDBNotificationReadCursor | null
}

/**
 * @description 更新读取游标请求
 */
export interface DBUpdateReadCursorReq {
  userId: string
  category: string
  version: number
  lastReadAt: number
}

/**
 * @description 批量更新读取游标请求
 */
export interface DBBatchUpdateReadCursorsReq {
  cursors: Array<{
    userId: string
    category: string
    version: number
    lastReadAt: number
  }>
}