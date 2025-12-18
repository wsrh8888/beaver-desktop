// 用户同步状态服务请求和响应类型定义

import type { IDBUserSyncStatus } from '../../db/user'

// ===== 用户同步状态操作 =====

/**
 * @description 获取用户同步状态请求
 */
export interface DBGetUserSyncStatusReq {
  userId: string
}

/**
 * @description 获取用户同步状态响应
 */
export interface DBGetUserSyncStatusRes {
  syncStatus?: IDBUserSyncStatus
}

/**
 * @description 批量获取用户同步状态请求
 */
export interface DBGetUsersSyncStatusReq {
  userIds: string[]
}

/**
 * @description 批量获取用户同步状态响应
 */
export type DBGetUsersSyncStatusRes = IDBUserSyncStatus[]

/**
 * @description 获取所有用户同步状态请求
 */
export interface DBGetAllUsersSyncStatusReq {}

/**
 * @description 获取所有用户同步状态响应
 */
export type DBGetAllUsersSyncStatusRes = IDBUserSyncStatus[]

/**
 * @description 更新或插入用户同步状态请求
 */
export interface DBUpsertUserSyncStatusReq {
  userId: string
  userVersion: number
}

/**
 * @description 批量更新用户同步状态请求
 */
export interface DBBatchUpsertUserSyncStatusReq {
  statuses: Array<{
    userId: string
    userVersion: number
  }>
}

/**
 * @description 删除用户同步状态请求
 */
export interface DBDeleteUserSyncStatusReq {
  userId: string
}

/**
 * @description 批量删除用户同步状态请求
 */
export interface DBBatchDeleteUserSyncStatusReq {
  userIds: string[]
}

/**
 * @description 清空所有同步状态请求
 */
export interface DBClearAllSyncStatusReq {}

/**
 * @description 获取需要同步的用户列表请求
 */
export interface DBGetUsersNeedSyncReq {
  serverVersions: Record<string, number>
}

/**
 * @description 获取需要同步的用户列表响应
 */
export interface DBGetUsersNeedSyncRes {
  userIds: string[]
}