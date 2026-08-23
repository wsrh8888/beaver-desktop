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

// 群组表 (与服务器端 group_models.GroupModel 保持一致)
export interface IDBGroup {
  id?: number
  groupId: string // 对应服务器端的 GroupID
  type?: number
  title: string
  avatar?: string // 对应服务器端的 Avatar，默认 'a9de5548bef8c10b92428fff61275c72.png'
  creatorId: string
  notice?: string
  joinType?: number
  status?: number
  version?: number // 对应服务器端的 Version (int64 default 0)
  createdAt?: number
  updatedAt?: number
}

// 群成员表 (与服务器端 group_models.GroupMemberModel 保持一致)
export interface IDBGroupMember {
  id?: number
  groupId: string
  userId: string
  role?: number // 1群主 2管理员 3普通成员
  status?: number // 1正常 2退出 3被踢
  joinTime?: number // 加入时间，对应服务器端的 JoinTime
  version?: number // 群组成员列表版本号
  createdAt?: number
  updatedAt?: number
}

// 入群申请表
export interface IDBGroupJoinRequest {
  id?: number
  groupId: string
  applicantUserId: string
  message?: string
  status?: number
  handledBy?: string
  handledAt?: number
  version?: number
  createdAt?: number
  updatedAt?: number
}

// 群组同步状态表
export interface IDBGroupSyncStatus {
  id?: number
  groupId: string // 群组ID
  module: string // 同步模块: 'info' | 'members' | 'requests'
  version?: number // 版本号
  updatedAt?: number
}
