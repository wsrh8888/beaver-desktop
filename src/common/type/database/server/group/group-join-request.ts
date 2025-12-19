// 入群申请服务请求和响应类型定义

import type { IDBGroupJoinRequest } from '../../db/group'

// ===== 入群申请操作 =====

/**
 * @description 创建入群申请请求
 */
export interface DBCreateGroupJoinRequestReq extends Omit<IDBGroupJoinRequest, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建入群申请请求
 */
export interface DBBatchCreateGroupJoinRequestsReq {
  requests: Omit<IDBGroupJoinRequest, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 根据群组ID列表获取入群申请记录请求（简化版）
 */
export interface DBGetJoinRequestsByGroupIdsSimpleReq {
  groupIds: string[]
  options?: { page?: number, limit?: number }
}

/**
 * @description 根据群组ID列表获取入群申请记录响应（简化版）
 */
export type DBGetJoinRequestsByGroupIdsSimpleRes = IDBGroupJoinRequest[]

/**
 * @description 根据申请者ID获取群组申请记录请求
 */
export interface DBGetJoinRequestsByApplicantIdReq {
  applicantUserId: string
  options?: { page?: number, limit?: number }
}

/**
 * @description 根据申请者ID获取群组申请记录响应
 */
export type DBGetJoinRequestsByApplicantIdRes = IDBGroupJoinRequest[]

/**
 * @description 根据申请者ID获取群组申请数量请求
 */
export interface DBGetJoinRequestsCountByApplicantIdReq {
  applicantUserId: string
}

/**
 * @description 根据申请者ID获取群组申请数量
 */
export type DBGetJoinRequestsCountByApplicantIdRes = number

/**
 * @description 根据群组ID列表获取群组申请数量请求
 */
export interface DBGetJoinRequestsCountByGroupIdsReq {
  groupIds: string[]
}

/**
 * @description 根据群组ID列表获取群组申请数量
 */
export type DBGetJoinRequestsCountByGroupIdsRes = number