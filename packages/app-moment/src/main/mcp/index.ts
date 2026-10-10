/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 朋友圈 MCP 模块出口。activate 时 registerMomentMcp 注册进宿主 McpHost。 */
import { registerMcpServer } from '@beaver-im/beaver/main'
import { createMomentServer } from './server'

export { createMomentServer } from './server'
export { MOMENT_TOOLS } from './tools'

/**
 * 工具级元信息：哪些工具调用前需要用户在 AI 聊天框确认参数。
 * 只读/幂等（list/detail/like/comment）直接执行，创作类（post_moment）需确认。
 */
const MOMENT_TOOL_META = {
  post_moment: { requiresConfirm: true },
} as const

/** activate 时调：把朋友圈 MCP server 注册进宿主 McpHost。 */
export function registerMomentMcp(): void {
  registerMcpServer('moment', createMomentServer, { toolMeta: MOMENT_TOOL_META })
}
