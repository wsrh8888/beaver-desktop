/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @description: MCP 工具与 server 清单类型，对齐服务端 app/types McpToolSchema/McpServerManifest。
 * 客户端按此结构聚合 tools/list，上报给服务端 reportCapabilities 端点。
 */

/** 一个 MCP 工具的 schema。inputSchema 是 JSON Schema，描述工具入参。 */
export interface IMcpToolSchema {
  name: string
  description: string
  /** JSON Schema 对象，描述工具入参。允许任意字段，服务端不校验 schema 本身。 */
  inputSchema: Record<string, any>
  /**
   * 是否需要用户在 AI 聊天框确认后再执行。
   * true = AI 调用工具前，先按 schema 渲染确认卡片让用户确认/编辑参数，确认后才下发 tool_call。
   * false（默认）= AI 直接调用，工具拿到参数即执行。
   * 工具声明方（各 app 包）按操作性质设置：只读/幂等 false，有副作用的创作类 true。
   */
  requiresConfirm?: boolean
}

/** 一个 MCP server 的能力清单。transport 决定服务端执行路径。 */
export interface IMcpServerManifest {
  name: string
  version: string
  /**
   * transport: 执行路径。
   *   "client" = 客户端本机执行，走 host 事件下发（request_host）
   *   "service" = 微服务执行，走 call_go_tool 转 Go
   */
  transport: 'client' | 'service'
  tools: IMcpToolSchema[]
}

/**
 * 上报客户端能力清单（MCP tools/list 聚合）。
 * deviceId / token 由 ajax 拦截器随每个请求 header 带上，
 * 服务端 report_capabilities 读 deviceId header，无需此处显式传。
 */
export interface IReportCapabilitiesReq {
  source: 'client' | 'service'
  conversationId?: string
  servers: IMcpServerManifest[]
}

/** reportCapabilities 响应。 */
export interface IReportCapabilitiesRes {
  accepted: boolean
  toolCount: number
}

/**
 * 服务端下发的 host 工具调用事件 payload。
 * root（工作目录）跟会话走：会话绑定工作空间时存服务端，随事件下发。
 * 云端会话（无 root）客户端禁止写盘。
 */
export interface IHostEventPayload {
  requestId?: string
  server?: string
  tool?: string
  args?: Record<string, any>
  /** 工作目录绝对路径。会话绑定时存服务端，随 host 事件下发。云端会话无此字段。 */
  root?: string
}

/** 本机工具执行完，把结果交回正在等待的 sendMessage。 */
export interface ISubmitHostResultReq {
  requestId: string
  ok: boolean
  data?: Record<string, any>
  error?: string
}
