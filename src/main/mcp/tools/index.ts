/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 内置工具的 MCP 配置聚合。按维度分文件（shell/fs/search/git/analyze），
 * 每个文件导出 registerXxxTools(server) + 本组 toolMeta。
 * 本文件聚合成 createBuiltinServer（建一个 McpServer，register 全部）+ BUILTIN_TOOL_META。
 *
 * 这是大厂（Cursor/Claude Code）模型：内置工具不是被 if 链直接调用，而是包成
 * in-process MCP server，router 通过 tools/list 发现、tools/call 调用。
 *
 * 这里只做 MCP 暴露层（zod schema + registerTool + 调实现）；工具实现下沉到
 * src/main/tools/<domain>/，按能力域分目录，ipc 也可调同一份实现。
 *
 * BUILTIN_TOOL_META 声明每个工具的 requiresConfirm，router 连接时读它合并进 manifest。
 * 是否弹确认卡片由 receivers/agent 决定。
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ANALYZE_TOOL_META, registerAnalyzeTools } from './analyze'
import { FS_TOOL_META, registerFsTools } from './fs'
import { GIT_TOOL_META, registerGitTools } from './git'
import { SEARCH_TOOL_META, registerSearchTools } from './search'
import { SHELL_TOOL_META, registerShellTools } from './shell'

/**
 * 全部内置工具的元信息（聚合各维度）。requiresConfirm=true 的工具执行前会在 AI 聊天框
 * 弹确认卡片，用户确认/编辑参数后才执行（见 receivers/agent/confirm.ts）。
 * 不列出的工具默认 requiresConfirm=false（只读工具，直接执行）。
 */
export const BUILTIN_TOOL_META: Record<string, { requiresConfirm?: boolean }> = {
  ...SHELL_TOOL_META,
  ...FS_TOOL_META,
  ...SEARCH_TOOL_META,
  ...GIT_TOOL_META,
  ...ANALYZE_TOOL_META,
}

/**
 * 构造内置 MCP server（server name 固定 'beaver-builtin'）。
 * 建一个 McpServer，按维度 register 全部工具。由 router 用 InMemoryTransport 连接。
 */
export function createBuiltinServer(): McpServer {
  const server = new McpServer(
    { name: 'beaver-builtin', version: '1.0.0' },
    { capabilities: { tools: {} } },
  )

  registerShellTools(server)
  registerFsTools(server)
  registerSearchTools(server)
  registerGitTools(server)
  registerAnalyzeTools(server)

  return server
}
