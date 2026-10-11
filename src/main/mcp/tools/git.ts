/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * git 类工具的 MCP 配置。实现见 mainModule/tools/git。
 * git_status/git_diff 只读，不需确认。
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { requireToolRoot } from '../toolRoot'
import { gitStatus, gitDiff } from 'mainModule/tools/git'

/** 本组工具元信息。均只读，不需确认。 */
export const GIT_TOOL_META: Record<string, { requiresConfirm?: boolean }> = {}

/** 把 git 类工具注册进 server。 */
export function registerGitTools(server: McpServer): void {
  server.registerTool('git_status', {
    description: '查看工作目录 git 仓库状态（git status --short --branch）。',
    inputSchema: {},
  }, async (args) => {
    const root = requireToolRoot()
    const text = await gitStatus(root)
    return { content: [{ type: 'text', text }] }
  })

  server.registerTool('git_diff', {
    description: '查看工作目录 git diff。cached=true 看暂存区，path 限定到某路径。',
    inputSchema: {
      cached: z.boolean().default(false).describe('true=看已暂存改动'),
      path: z.string().optional().describe('限定路径（相对工作目录）'),
    },
  }, async (args) => {
    const root = requireToolRoot()
    const text = await gitDiff(root, args as any)
    return { content: [{ type: 'text', text }] }
  })
}
