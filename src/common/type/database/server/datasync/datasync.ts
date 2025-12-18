// 数据同步服务请求和响应类型定义

import type { IDBDatasync } from '../../db/datasync'

// ===== 数据同步操作 =====

/**
 * @description 获取同步游标请求
 */
export interface DBGetSyncCursorReq {
  module: string
}

/**
 * @description 获取同步游标响应
 */
export interface DBGetSyncCursorRes {
  cursor?: IDBDatasync
}

/**
 * @description 获取同步游标（旧接口）请求
 */
export interface DBGetByDataTypeReq {
  dataType: string
}

/**
 * @description 获取同步游标（旧接口）响应
 */
export interface DBGetByDataTypeRes {
  cursor?: IDBDatasync
}

/**
 * @description 创建或更新同步游标请求
 */
export interface DBUpsertSyncCursorReq {
  cursorData: {
    module: string
    version?: number | null
    updatedAt: number
  }
}

/**
 * @description 创建或更新同步游标（旧接口）请求
 */
export interface DBUpsertByDataTypeReq {
  cursorData: {
    dataType: string
    lastSeq: number
  }
}