// 媒体服务请求和响应类型定义

import type { IDBMedia } from '../../db/media'

// ===== 媒体操作 =====

/**
 * @description 添加或更新媒体记录请求
 */
export interface DBUpsertMediaReq {
  url: string
  md5?: string
  path: string
  type: string
  size?: number
}

/**
 * @description 根据完整 URL 获取媒体缓存信息请求
 */
export interface DBGetMediaInfoReq {
  url: string
}

/**
 * @description 根据完整 URL 获取媒体缓存信息响应
 */
export type DBGetMediaInfoRes = {
  url: string
  md5?: string
  path: string
  type: string
  size?: number
  createdAt: number
  updatedAt: number
  isDeleted: number
} | null

/**
 * @description 标记为删除状态请求
 */
export interface DBDeleteMediaReq {
  url: string
}
