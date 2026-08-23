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

// 媒体服务请求和响应类型定义

import type { IDBMedia } from '../../db/media'

// ===== 媒体操作 =====

/**
 * @description 添加或更新媒体记录请求
 */
export interface DBUpsertMediaReq {
  url: string
  md5?: string
  path: string
  type: string
  size?: number
}

/**
 * @description 根据完整 URL 获取媒体缓存信息请求
 */
export interface DBGetMediaInfoReq {
  url: string
}

/**
 * @description 根据完整 URL 获取媒体缓存信息响应
 */
export type DBGetMediaInfoRes = {
  url: string
  md5?: string
  path: string
  type: string
  size?: number
  createdAt: number
  updatedAt: number
  isDeleted: number
} | null

/**
 * @description 标记为删除状态请求
 */
export interface DBDeleteMediaReq {
  url: string
}
