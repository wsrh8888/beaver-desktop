/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 代码分析类工具的 MCP 配置。实现见 mainModule/tools/analyze。
 * symbol_search/outline 只读，不需确认。
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { assertRoot } from 'mainModule/tools/shared'
import { symbolSearch, outline } from 'mainModule/tools/analyze'

/** 本组工具元信息。均只读，不需确认。 */
export const ANALYZE_TOOL_META: Record<string, { requiresConfirm?: boolean }> = {}

/** 把代码分析类工具注册进 server。 */
export function registerAnalyzeTools(server: McpServer): void {
  server.registerTool('symbol_search', {
    description: '按符号名搜索定义位置（函数/类/接口/类型/const 等）。只命中声明行，比 grep 更精确锁定定义。',
    inputSchema: {
      name: z.string().describe('符号名'),
      path: z.string().default('.').describe('搜索起点（文件或目录）'),
      include: z.string().optional().describe('文件名 glob 过滤，如 *.ts'),
    },
  }, async (args) => {
    const root = assertRoot(String((args as any).__root || ''))
    const entries = await symbolSearch(root, args as any)
    return { content: [{ type: 'text', text: entries.length ? entries.join('\n') : '(no matches)' }] }
  })

  server.registerTool('outline', {
    description: '查看一个文件的符号大纲（函数/类/接口/类型等声明 + 行号），快速理解结构。',
    inputSchema: {
      path: z.string().describe('相对于工作目录的文件路径'),
    },
  }, async (args) => {
    const root = assertRoot(String((args as any).__root || ''))
    const text = await outline(root, args as any)
    return { content: [{ type: 'text', text }] }
  })
}
