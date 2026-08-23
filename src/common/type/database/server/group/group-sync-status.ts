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

// 群组同步状态服务请求和响应类型定义

/**
 * @description 批量获取指定模块的版本状态请求
 */
export interface DBGetModuleVersionsReq {
  module: string
  groupIds: string[]
}

/**
 * @description 批量获取指定模块的版本状态响应
 */
export type DBGetModuleVersionsRes = Array<{ groupId: string; version: number }>

/**
 * @description 更新指定模块的同步状态请求
 */
export interface DBUpsertSyncStatusReq {
  module: string
  groupId: string
  version: number
}
