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
 * 验证缓存键格式
 */
export function validateCacheKey(key: string, type: string): boolean {
  if (!key || typeof key !== 'string') {
    return false
  }

  switch (type) {
    case 'chat_messages':
      return key.includes('_') // 格式: user_123_user_456
    case 'avatar':
      return /^[\w.-]+$/.test(key) // 格式: 文件名（支持扩展名）
    case 'sticker':
      return key.includes(':') // 格式: category:stickerId
    case 'moment':
      return key.includes(':') // 格式: userId:date
    case 'update_package':
      return /^\d+\.\d+\.\d+$/.test(key) // 格式: 1.0.0
    default:
      return true
  }
}

/**
 * 验证版本号格式
 */
export function validateVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version)
}

/**
 * 验证用户ID格式
 */
export function validateUserId(userId: string): boolean {
  return /^\w+$/.test(userId)
}

/**
 * 验证文件名格式
 */
export function validateFileName(fileName: string): boolean {
  // 支持常见的文件名格式：字母、数字、下划线、点、连字符
  return /^[\w.-]+$/.test(fileName) && fileName.length > 0 && fileName.length < 255
}
