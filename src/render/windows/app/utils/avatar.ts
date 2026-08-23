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
 * @description: 处理头像路径，数据库存储完整 URL
 */
export function processAvatarUrl(avatar: string): string {
  return avatar?.trim() || ''
}

/**
 * @description: 批量处理对象中的头像字段
 */
export function processObjectAvatar<T extends Record<string, any>>(
  obj: T,
  avatarField: string = 'avatar',
): T {
  if (!obj || !obj[avatarField])
    return obj

  return {
    ...obj,
    [avatarField]: processAvatarUrl(obj[avatarField]),
  }
}

/**
 * @description: 批量处理数组中对象的头像字段
 */
export function processArrayAvatars<T extends Record<string, any>>(
  array: T[],
  avatarField: string = 'avatar',
): T[] {
  return array?.map(item => processObjectAvatar(item, avatarField))
}

/**
 * @description: 处理消息发送者的头像
 */
export function processSenderAvatar(sender: any): any {
  if (!sender)
    return sender

  return {
    ...sender,
    avatar: processAvatarUrl(sender.avatar),
  }
}
