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

// 群组服务请求和响应类型定义

import type { IDBGroup } from '../../db/group'

// ===== 群组操作 =====

/**
 * @description 创建群组请求
 */
export interface DBCreateGroupReq extends Omit<IDBGroup, 'id' > {}

/**
 * @description 创建或更新群组请求
 */
export interface DBUpsertGroupReq extends Omit<IDBGroup, 'id' > {}

/**
 * @description 获取群组信息请求
 */
export interface DBGetGroupReq {
  groupId: string
}

/**
 * @description 获取群组信息响应
 */
export interface DBGetGroupRes {
  group?: IDBGroup | null
}

/**
 * @description 更新群组信息请求
 */
export interface DBUpdateGroupReq {
  groupId: string
  updateData: Partial<Omit<IDBGroup, 'id' | 'createdAt'>>
}

/**
 * @description 删除群组请求
 */
export interface DBDeleteGroupReq {
  groupId: string
}

/**
 * @description 获取用户加入的群组请求
 */
export interface DBGetUserGroupsReq {
  userId: string
}

/**
 * @description 获取用户加入的群组响应
 */
export interface DBGetUserGroupsRes {
  groups: IDBGroup[]
}

/**
 * @description 批量创建群组请求
 */
export interface DBBatchCreateGroupsReq {
  groups: Omit<IDBGroup, 'id' >[]
}

/**
 * @description 批量插入或更新群组请求
 */
export interface DBBatchUpsertGroupsReq {
  groups: Omit<IDBGroup, 'id' >[]
}