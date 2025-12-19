// 好友验证服务请求和响应类型定义

import type { IValidInfo } from '../../../ajax/friend'
import type { IDBFriendVerify } from '../../db/friend'

// ===== 好友验证操作 =====

/**
 * @description 创建好友验证记录请求
 */
export interface DBCreateFriendVerifyReq {
  verifyId: string
  sendUserId: string
  revUserId: string
  sendStatus: number
  revStatus: number
  message?: string
  source?: string
  version: number
  createdAt: number
  updatedAt: number
}

/**
 * @description 创建好友验证记录响应
 */
export interface DBCreateFriendVerifyRes {
  // 创建操作没有返回值
}

/**
 * @description 根据验证记录ID批量查询好友验证记录请求
 */
export interface DBGetFriendVerifiesByIdsReq {
  verifyIds: string[]
}

/**
 * @description 根据验证记录ID批量查询好友验证记录响应
 */
export type DBGetFriendVerifiesByIdsRes = Map<string, any>

/**
 * @description 批量创建好友验证记录请求
 */
export interface DBBatchCreateFriendVerifiesReq {
  verifies: Array<{
    verifyId: string
    sendUserId: string
    revUserId: string
    sendStatus: number
    revStatus: number
    message?: string
    source?: string
    version: number
    createdAt: number
    updatedAt: number
  }>
}

/**
 * @description 批量创建好友验证记录响应
 */
export interface DBBatchCreateFriendVerifiesRes {
  // 批量创建操作没有返回值
}

/**
 * @description 获取好友验证列表请求
 */
export interface DBGetValidListReq {
  userId: string
  page?: number
  limit?: number
}

/**
 * @description 获取好友验证列表响应
 */
export type DBGetValidListRes = IDBFriendVerify[]

/**
 * @description 根据版本范围获取验证列表请求
 */
export interface DBGetValidByVerRangeReq {
  userId: string
  startVersion?: number
  endVersion?: number
}

/**
 * @description 根据版本范围获取验证列表响应
 */
export type DBGetValidByVerRangeRes = IDBFriendVerify[]

/**
 * @description 根据验证记录ID列表批量查询验证记录请求
 */
export interface DBGetValidByIdsReq {
  verifyIds: string[]
  currentUserId: string
}

/**
 * @description 根据验证记录ID列表批量查询验证记录响应
 */
export type DBGetValidByIdsRes = IDBFriendVerify[]
