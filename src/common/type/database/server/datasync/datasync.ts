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

// 数据同步服务请求和响应类型定义

import type { IDBDatasync } from '../../db/datasync'

// ===== 数据同步操作 =====

/**
 * @description 获取同步游标请求
 */
export interface DBGetSyncCursorReq {
  module: string
}

/**
 * @description 获取同步游标响应
 */
export type DBGetSyncCursorRes = IDBDatasync | undefined
/**
 * @description 获取同步游标（旧接口）请求
 */
export interface DBGetByDataTypeReq {
  dataType: string
}

/**
 * @description 获取同步游标（旧接口）响应
 */
export type DBGetByDataTypeRes = IDBDatasync | undefined

/**
 * @description 创建或更新同步游标请求
 */
export interface DBUpsertSyncCursorReq {
  module: string
    version?: number | null
    updatedAt: number
}

/**
 * @description 创建或更新同步游标（旧接口）请求
 */
export interface DBUpsertByDataTypeReq {
  dataType: string
    lastSeq: number
}