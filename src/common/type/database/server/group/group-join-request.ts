/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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