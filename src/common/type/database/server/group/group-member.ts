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

// 群成员服务请求和响应类型定义

import type { IDBGroupMember } from '../../db/group'

// ===== 群成员操作 =====

/**
 * @description 添加群成员请求
 */
export interface DBAddGroupMemberReq extends Omit<IDBGroupMember, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量添加群成员请求
 */
export interface DBBatchAddGroupMembersReq {
  members: Omit<IDBGroupMember, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 获取群成员列表请求
 */
export interface DBGetGroupMembersReq {
  groupId: string
}

/**
 * @description 获取群成员列表响应
 */
export type DBGetGroupMembersRes = IDBGroupMember[]

/**
 * @description 获取用户加入的群组成员记录请求
 */
export interface DBGetUserMembershipsReq {
  userId: string
}

/**
 * @description 获取用户加入的群组成员记录响应
 */
export type DBGetUserMembershipsRes = IDBGroupMember[]

/**
 * @description 更新群成员信息请求
 */
export interface DBUpdateGroupMemberReq {
  groupId: string
  userId: string
  updateData: Partial<Omit<IDBGroupMember, 'id' | 'createdAt'>>
}

/**
 * @description 移除群成员请求
 */
export interface DBRemoveGroupMemberReq {
  groupId: string
  userId: string
}