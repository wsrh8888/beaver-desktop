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
import { requireToolRoot } from '../toolRoot'
import { globFiles, grepFiles } from 'mainModule/tools/search'

/** 本组工具元信息。均只读，不需确认。 */
export const SEARCH_TOOL_META: Record<string, { requiresConfirm?: boolean }> = {}

/** 把搜索类工具注册进 server。 */
export function registerSearchTools(server: McpServer): void {
  server.registerTool('glob', {
    description: '只在当前工作空间根目录内按 glob 匹配相对路径。搜不到不代表绝对路径上的文件不存在。',
    inputSchema: {
      pattern: z.string().describe('glob 模式，如 **/*.ts'),
    },
  }, async (args) => {
    const root = requireToolRoot()
    const entries = await globFiles(root, String(args.pattern || ''))
    const empty = `(no matches)\nsearched_root: ${root}\npattern 只匹配该根目录下的相对路径。`
    return { content: [{ type: 'text', text: entries.length ? entries.join('\n') : empty }] }
  })

  server.registerTool('grep', {
    description: '按正则搜索文件内容。path 默认当前工作目录，也可传本机绝对路径。',
    inputSchema: {
      pattern: z.string().describe('正则表达式'),
      path: z.string().default('.').describe('搜索起点：相对工作目录，或本机绝对路径'),
      include: z.string().optional().describe('文件名 glob 过滤，如 *.ts'),
    },
  }, async (args) => {
    const root = requireToolRoot()
    const entries = await grepFiles(root, args as any)
    return { content: [{ type: 'text', text: entries.length ? entries.join('\n') : '(no matches)' }] }
  })
}
