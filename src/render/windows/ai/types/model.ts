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
 * 模型固有能力画像（对标 Azure/OpenAI model card）。
 * 用于「适不适合某类任务」，不是价格。
 */
export interface IAiModelCapabilities {
  vision: boolean
  tools: boolean
  reasoning: boolean
  structuredOutput: boolean
  longContext: boolean
}

/** 档位：对标 Luna/Terra/Sol、Haiku/Sonnet/Opus；UI 可映射为相对速度 */
export type AiModelTier = 'fast' | 'balanced' | 'strong'

/** 模型来源 */
export type AiModelSource = 'official' | 'custom'

/** 官方虚拟 Auto 模型 id（服务端写死返回；agent 收到后自行选模） */
export const AI_MODEL_AUTO_ID = 'auto'

export interface IAiSelectedModel {
  source: AiModelSource
  id: string
}

/** 平台官方模型（含虚拟 Auto） */
export interface IAiOfficialModel {
  id: string
  name: string
  provider: string
  modelName: string
  endpoint: string
  tier: AiModelTier | string
  capabilities: IAiModelCapabilities
  sort: number
}

/** 用户自定义模型 */
export interface IAiCustomModel {
  id: string
  name: string
  endpoint: string
  apiKey: string
  tier: AiModelTier | string
  capabilities: IAiModelCapabilities
}

export type AiSettingsSection = 'model'
