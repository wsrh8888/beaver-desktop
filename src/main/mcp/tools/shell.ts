/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * shell 类工具的 MCP 配置（zod schema + registerTool）。实现见 mainModule/tools/shell。
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { assertRoot } from 'mainModule/tools/shared'
import { runBash } from 'mainModule/tools/shell'

/** 本组工具元信息。bash 跑命令有副作用，执行前需用户确认。 */
export const SHELL_TOOL_META: Record<string, { requiresConfirm?: boolean }> = {
  bash: { requiresConfirm: true },
}

/** 把 shell 类工具注册进 server。 */
export function registerShellTools(server: McpServer): void {
  server.registerTool('bash', {
    description: '在工作目录执行 shell 命令。命令里的 cd / 绝对路径可以离开目录。',
    inputSchema: {
      command: z.string().describe('要执行的 shell 命令'),
      timeout: z.number().int().default(30).describe('超时秒数（1-120）'),
    },
  }, async (args) => {
    const root = assertRoot(String((args as any).__root || ''))
    const r = await runBash(root, String(args.command || ''), Number(args.timeout) || 30)
    const parts = [r.stdout]
    if (r.stderr)
      parts.push(`[stderr]\n${r.stderr}`)
    parts.push(`[exit ${r.returncode}]`)
    if (r.truncated)
      parts.push('[output truncated]')
    return { content: [{ type: 'text', text: parts.filter(Boolean).join('\n') }] }
  })
}
