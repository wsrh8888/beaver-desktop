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

/** 多模态 part（用户真实输入） */
export interface IAgentMessagePart {
  type: 'text' | 'image' | 'file'
  text?: string
  fileId?: string
  fileUrl?: string
  name?: string
  mime?: string
  size?: number
  width?: number
  height?: number
}

export interface ISendAgentMessageReq {
  conversationId?: string
  topicId?: string
  parts: IAgentMessagePart[]
  interactMode?: 'ask' | 'plan' | 'craft'
  permissionMode?: 'default' | 'full'
  clientMsgId?: string
  modelId?: string
  modelSource?: 'official' | 'custom'
  /** workspace | chat | circle | moment */
  module?: string
  /** 场景绑定 ID，如 IM conversationId */
  refId?: string
}

export interface ISendAgentMessageRes {
  conversationId: string
  topicId: string
  messageId: string
  status: string
}

/** Agent 话题（会话内的上下文边界；新建话题 = 清空上下文） */
export interface IAgentTopicItem {
  topicId: string
  conversationId: string
  title: string
  updatedAt: number
  version: number
}

export interface IListAgentTopicsReq {
  conversationId: string
}

export interface IListAgentTopicsRes {
  list: IAgentTopicItem[]
}

/** Agent 历史消息（对齐 agent_api 的 AgentMessageItem） */
export interface IAgentMessageItem {
  /** 库内自增主键：只作分页游标（beforeId） */
  id: number
  messageId: string
  topicId: string
  conversationId: string
  userId: string
  role: 'user' | 'assistant'
  msgType: number
  msg: { type?: number, textMsg?: { content: string } }
  parts: IAgentMessagePart[]
  preview: string
  clientMsgId: string
  status: number
  llmMetaJson: string
  createdAt: number
  version: number
}

export interface IListAgentMessagesReq {
  topicId: string
  beforeId?: number
  afterVersion?: number
  limit?: number
}

export interface IListAgentMessagesRes {
  list: IAgentMessageItem[]
}

/**
 * AI 面板里渲染的一条对话消息（前端视图模型，与 IAgentMessageItem 解耦）。
 * 通用件 aiPanel 与各场景容器共用，所以放 common 而不是某个 store 里。
 */
export interface IAiChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** 正在流式输出：气泡尾部显示打字点 */
  streaming?: boolean
  timestamp: number
  /**
   * 分页游标 = 服务端那条消息的自增主键。
   * 只有从服务端拉下来的才有；本地乐观插入的用户气泡和服务端占位气泡没有，
   * 所以加载更多时要从「第一条带游标的消息」取。
   */
  cursor?: number
}

/**
 * Agent 请求用户在本机确认的动作（代发消息、删文件等）。
 * 服务端挂起等回传；这里只是前端拿着的一张待办卡片。
 *
 * 文案与语气由发起方（agent）决定，卡片只负责画：
 * 同一个组件既能问「发送」，也能问「删除」，不必按动作各写一张卡。
 */
export interface IAgentConfirmRequest {
  requestId: string
  /** 动作名，如「以你的名义发送」「删除这个文件」 */
  title: string
  /** 正文预览（如待发出的消息原文、待删除项） */
  content: string
  /** 主按钮文案：发送 / 删除 / 允许 */
  confirmText: string
  /** 次按钮文案 */
  cancelText: string
  /** danger 用于删除等不可逆动作 */
  tone: 'default' | 'danger'
  /** 过期时间戳；到点自动判否，与服务端超时对齐 */
  expiresAt: number
}
