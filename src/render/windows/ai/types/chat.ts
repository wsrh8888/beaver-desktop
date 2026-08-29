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
 * 产物类型：右侧面板里每种类型用各自的渲染器呈现。
 * - md   Markdown 文档（可同时存在多个 tab）
 * - html 网页（整页渲染，同一会话仅允许 1 个 tab）
 */
export type AiArtifactType = 'md' | 'html'

/**
 * 产物 = 右侧面板的一个 tab。每个产物有自己的名字与类型，按类型选择渲染器。
 */
export interface IAiArtifact {
  id: string
  name: string
  type: AiArtifactType
  content: string
  timestamp: number
}

/**
 * 统一条目（一个会话）：
 * - spaceId === null → 云端会话（多端可见）
 * - spaceId 有值 → 某本机空间下的会话
 */
export interface IAiChat {
  id: string
  title: string
  timestamp: number
  spaceId: string | null
  skillId?: string
  messages: IAiMessage[]
  artifacts: IAiArtifact[]
}

export interface IAiChatListItem {
  id: string
  title: string
  timestamp: number
  spaceId: string | null
}
