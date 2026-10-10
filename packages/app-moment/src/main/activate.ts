/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IMainActivateContext } from '@beaver-im/beaver'
import { registerMomentMcp } from './mcp'

/**
 * 朋友圈插件 activate。
 * 注册朋友圈 MCP server（open_moment/list_moments/post_moment/like/comment），
 * 宿主 McpHost.start() 会 InMemoryTransport 连接、拉 tools/list、上报给 agent_server。
 */
export async function activate(_ctx: IMainActivateContext): Promise<void> {
  registerMomentMcp()
}
