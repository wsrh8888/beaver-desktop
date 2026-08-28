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

export type AiMessageRole = 'user' | 'assistant'

export interface IAiMessage {
  id: string
  role: AiMessageRole
  content: string
  timestamp: number
  streaming?: boolean
  fromVoice?: boolean
}

/**
 * 本机工作空间。
 * deviceGuid 标识所属电脑；PC 端只展示本机空间。
 * path 为磁盘绝对路径。
 */
export interface IAiSpace {
  id: string
  name: string
  deviceGuid: string
  path: string
}

/**
 * 统一条目：
 * - spaceId === null → 云端「任务」（多端可见）
 * - spaceId 有值 → 某空间下的「会话」
 */
export interface IAiTask {
  id: string
  title: string
  timestamp: number
  spaceId: string | null
  skillId?: string
  messages: IAiMessage[]
}

export interface IAiTaskListItem {
  id: string
  title: string
  timestamp: number
  spaceId: string | null
}
