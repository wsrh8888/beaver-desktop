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

/**
 * @description: 缓存类型枚举 - 基于开源IM项目分析
 */
export enum CacheType {
  USER_AVATAR = 'user_avatar',
  USER_DB = 'user_db',
  USER_LOGS = 'user_logs',
  PUBLIC_LOGS = 'public_logs',
  PUBLIC_UPDATE = 'public_update',
  USER_VIDEO = 'user_video',
  USER_IMAGE = 'user_image',
}

/**
 * @description: 缓存信息接口
 */
export interface ICacheInfo {
  /** 文件名 */
  fileName: string
  /** 过期时间戳 */
  expireTime: number
  /** 文件大小 */
  size?: number
  /** MD5值 */
  md5?: string
}
