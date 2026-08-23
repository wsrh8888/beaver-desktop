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
 * @description: 会话 Pinia Store 类型定义
 * 用于 render 进程的会话管理
 */

/**
 * @description: 会话项（Store 内部存储类型）
 * 只包含原始数据，不包含格式化后的展示字段
 */
export interface IConversationItem {
  /**
   * @description: 会话ID
   */
  conversationId: string
  /**
   * @description: 头像
   */
  avatar: string
  /**
   * @description: 昵称
   */
  nickName: string
  /**
   * @description: 消息预览
   */
  msgPreview: string
  /**
   * @description: 消息时间戳（原始时间戳，秒级，用于排序和格式化）
   */
  updatedAt: number
  /**
   * @description: 是否置顶
   */
  isTop: boolean
  /**
   * @description: 会话类型
   */
  chatType: number
  /**
   * @description: 备注
   */
  notice: string
  /**
   * @description: 版本号
   */
  version: number
  /**
   * @description: 未读消息数
   */
  unreadCount: number
  /**
   * @description: 是否免打扰
   */
  isMuted: boolean
}
