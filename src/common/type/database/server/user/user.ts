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

// 用户服务请求和响应类型定义

import type { IDBUser } from '../../db/user'
import type { IUserInfoRes, IUserSyncItem } from 'commonModule/type/ajax/user'

// ===== 用户基础操作 =====

/**
 * @description 创建用户请求
 */
export interface DBCreateUserReq extends Omit<IDBUser, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 创建或更新用户请求
 */
export interface DBUpsertUserReq extends Omit<IDBUser, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建用户请求
 */
export interface DBBatchCreateUsersReq {
  usersData: Omit<IDBUser, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 获取用户信息请求
 */
export interface DBGetUserByIdReq {
  header: any
  data?: any
}

/**
 * @description 获取用户信息响应
 */
export interface DBGetUserByIdRes {
  userInfo?: IUserInfoRes | null
}

/**
 * @description 获取用户基本信息请求
 */
export interface DBGetUserBasicInfoReq {
  userId: string
}

/**
 * @description 获取用户基本信息响应
 */
export interface DBGetUserBasicInfoRes {
  userInfo?: {
    userId: string
    version: number
  } | null
}

/**
 * @description 批量获取用户基本信息请求
 */
export interface DBGetUsersBasicInfoReq {
  userIds: string[]
}

/**
 * @description 批量获取用户基本信息响应
 */
export type DBGetUsersBasicInfoRes = Array<{
  userId: string
  nickName: string
  avatar: string
  userType: number
}>

/**
 * @description 获取所有用户请求
 */
export interface DBGetAllUsersReq {}

/**
 * @description 获取所有用户响应
 */
export type DBGetAllUsersRes = Array<{
  userId: string
  nickName: string
  avatar: string
  abstract: string
  phone: string
  email: string
  gender: number
  userType: number
  status: number
  version: number
  createdAt: number
  updatedAt: number
}>