// 媒体服务请求和响应类型定义

import type { IDBMedia } from '../../db/media'

// ===== 媒体操作 =====

/**
 * @description 添加或更新媒体记录请求
 */
export interface DBUpsertMediaReq {
  fileKey: string
  path: string
  type: string
  size?: number
}

/**
 * @description 根据文件名获取媒体信息请求
 */
export interface DBGetMediaInfoReq {
  fileKey: string
}

/**
 * @description 根据文件名获取媒体信息响应
 */
export type DBGetMediaInfoRes = {
  fileKey: string
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
  fileKey: string
}