/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 搜索类工具的 MCP 配置。实现见 mainModule/tools/search。
 * glob/grep 只读，不需确认。
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { assertRoot } from 'mainModule/tools/shared'
import { globFiles, grepFiles } from 'mainModule/tools/search'

/** 本组工具元信息。均只读，不需确认。 */
export const SEARCH_TOOL_META: Record<string, { requiresConfirm?: boolean }> = {}

/** 把搜索类工具注册进 server。 */
export function registerSearchTools(server: McpServer): void {
  server.registerTool('glob', {
    description: '在工作目录内按 glob 模式匹配文件路径。',
    inputSchema: {
      pattern: z.string().describe('glob 模式，如 **/*.ts'),
    },
  }, async (args) => {
    const root = assertRoot(String((args as any).__root || ''))
    const entries = await globFiles(root, String(args.pattern || ''))
    return { content: [{ type: 'text', text: entries.length ? entries.join('\n') : '(no matches)' }] }
  })

  server.registerTool('grep', {
    description: '在工作目录内按正则搜索文件内容。',
    inputSchema: {
      pattern: z.string().describe('正则表达式'),
      path: z.string().default('.').describe('搜索起点（文件或目录）'),
      include: z.string().optional().describe('文件名 glob 过滤，如 *.ts'),
    },
  }, async (args) => {
    const root = assertRoot(String((args as any).__root || ''))
    const entries = await grepFiles(root, args as any)
    return { content: [{ type: 'text', text: entries.length ? entries.join('\n') : '(no matches)' }] }
  })
}
