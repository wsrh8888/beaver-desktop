/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

/**
 * MCP server 工厂：能力包 activate 时注册，宿主 McpHost.start() 统一用
 * InMemoryTransport 连接，聚合 tools/list 上报给 agent_server。
 *
 * 跟 registerIpcHandler / registerWsHandler 同构：包只认 name，宿主按 name 聚合。
 * 工具全名 `{server}__{tool}`，agent_server 据此路由，宿主 McpHost.callTool 据此分发。
 */
export type McpServerFactory = () => McpServer | Promise<McpServer>

/**
 * 工具级元信息。MCP SDK 的 ToolAnnotations 只允许固定 hint（readOnly/destructive/...），
 * beaver 自定义的 requiresConfirm（AI 调用前要在聊天框渲染确认卡片）走 sidecar 声明，
 * 宿主 connectServer 后合并进 manifest 上报给 agent_server。
 */
export interface IMcpToolMeta {
  /** 该工具调用前是否需要用户在 AI 聊天框确认参数。默认 false（只读/幂等），有副作用的创作类 true。 */
  requiresConfirm?: boolean
}

const servers = new Map<string, { factory: McpServerFactory, toolMeta: Record<string, IMcpToolMeta> }>()

/**
 * 注册一个 MCP server。能力包 activate() 调用：
 *   registerMcpServer('moment', () => createMomentServer(), {
 *     toolMeta: { post_moment: { requiresConfirm: true } }
 *   })
 * 宿主 McpHost.start() 会遍历所有已注册工厂，InMemoryTransport 连接后拉 tools/list。
 * toolMeta 按工具名声明 requiresConfirm 等元信息，合并进 manifest 上报给 agent_server，
 * agent_server 据此决定调用前是否让客户端渲染确认卡片。
 */
export function registerMcpServer(
  name: string,
  factory: McpServerFactory,
  opts: { toolMeta?: Record<string, IMcpToolMeta> } = {},
): void {
  servers.set(name, { factory, toolMeta: opts.toolMeta || {} })
}

/** 取所有已注册的 MCP server（宿主 McpHost.start() 遍历）。 */
export function getMcpServers(): Map<string, { factory: McpServerFactory, toolMeta: Record<string, IMcpToolMeta> }> {
  return servers
}
