// 入群申请服务请求和响应类型定义

import type { IDBGroupJoinRequest } from '../../db/group'

// ===== 入群申请操作 =====

/**
 * @description 创建入群申请请求
 */
export interface DBCreateGroupJoinRequestReq extends Omit<IDBGroupJoinRequest, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 获取群组的入群申请请求
 */
export interface DBGetGroupJoinRequestsReq {
  groupId: string
  status?: number
}

/**
 * @description 获取群组的入群申请响应
 */
export interface DBGetGroupJoinRequestsRes {
  requests: IDBGroupJoinRequest[]
}

/**
 * @description 处理入群申请请求
 */
export interface DBHandleGroupJoinRequestReq {
  requestId: string
  status: number
  handledBy: string
}

/**
 * @description 批量创建入群申请请求
 */
export interface DBBatchCreateGroupJoinRequestsReq {
  requests: Omit<IDBGroupJoinRequest, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 获取入群申请列表请求
 */
export interface DBGetJoinRequestsReq {
  options?: { page?: number, limit?: number }
}

/**
 * @description 获取入群申请列表响应
 */
export interface DBGetJoinRequestsRes {
  requests: IDBGroupJoinRequest[]
}

/**
 * @description 根据群组ID列表获取入群申请请求
 */
export interface DBGetJoinRequestsByGroupIdsReq {
  groupIds: string[]
  options?: { page?: number, limit?: number }
}

/**
 * @description 根据群组ID列表获取入群申请响应
 */
export interface DBGetJoinRequestsByGroupIdsRes {
  requests: IDBGroupJoinRequest[]
}

/**
 * @description 获取用户相关的入群申请请求
 */
export interface DBGetUserRelatedJoinRequestsReq {
  userId: string
  managedGroupIds: string[]
  options?: { page?: number, limit?: number }
}

/**
 * @description 获取用户相关的入群申请响应
 */
export interface DBGetUserRelatedJoinRequestsRes {
  requests: IDBGroupJoinRequest[]
}