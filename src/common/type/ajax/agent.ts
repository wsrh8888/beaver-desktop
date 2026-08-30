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

/** 模型能力画像（官方 / 自定义共用） */
export interface IAgentModelCapabilities {
  vision?: boolean
  tools?: boolean
  reasoning?: boolean
  structuredOutput?: boolean
  longContext?: boolean
}

/** 用户自定义模型列表项 */
export interface IAgentModelItem {
  modelId: string
  name: string
  endpoint: string
  apiKeyMasked: string
  tier: string
  capabilities: IAgentModelCapabilities
  status: number
  createdAt: number
}

export interface ICreateAgentModelReq {
  name: string
  endpoint: string
  apiKey: string
  tier?: string
  capabilities?: IAgentModelCapabilities
}

export interface ICreateAgentModelRes {
  model: IAgentModelItem
}

export interface IListAgentModelsReq {}

export interface IListAgentModelsRes {
  list: IAgentModelItem[]
}

export interface IUpdateAgentModelReq {
  modelId: string
  name?: string
  endpoint?: string
  apiKey?: string
  tier?: string
  capabilities?: IAgentModelCapabilities
  status?: number
}

export interface IUpdateAgentModelRes {
  model: IAgentModelItem
}

export interface IDeleteAgentModelReq {
  modelId: string
}

export interface IDeleteAgentModelRes {}

/** 官方模型列表项 */
export interface IAgentOfficialModelItem {
  modelId: string
  name: string
  provider: string
  modelName: string
  endpoint: string
  tier: string
  capabilities: IAgentModelCapabilities
  sort: number
  status: number
}

export interface IListOfficialModelsReq {}

export interface IListOfficialModelsRes {
  list: IAgentOfficialModelItem[]
}

/** Agent 会话 */
export interface IAgentItem {
  agentId: string
  name: string
  avatar?: string
  description?: string
  status: number
}

export interface ICreateAgentReq {
  name: string
  avatar?: string
  description?: string
}

export interface ICreateAgentRes {
  agent: IAgentItem
}

export interface ISendAgentMessageReq {
  agentId: string
  content: string
  clientMsgId?: string
  modelId?: string
  modelSource?: 'official' | 'custom'
}
