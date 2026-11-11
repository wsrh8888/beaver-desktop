/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 窗口 MCP server（宿主自带，跟 builtin 并列）。暴露开窗能力给 LLM：
 *   - open_window: 打开一个能力包窗口（moment/settings/call/...）
 *   - list_windows: 列出可用的窗口入口
 *
 * 复用宿主 activate-plugins 的 getPluginApplication 入口，不在本文件新建窗口逻辑。
 * server name 固定 'beaver-window'，工具全名如 beaver-window__open_window。
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import Logger from 'mainModule/utils/logger'
import { getPluginApplication, getPluginWindowNames } from 'mainModule/plugin/activate-plugins'

const logger = new Logger('mcp-window')

const SERVER_NAME = 'beaver-window'

/**
 * 工具元信息。open_window 会打开新窗口（有副作用），执行前弹确认卡片；
 * list_windows 只读，直接执行。跟 builtin 的 BUILTIN_TOOL_META 同理。
 */
export const TOOL_META: Record<string, { requiresConfirm?: boolean }> = {
  open_window: { requiresConfirm: true },
}

export function createWindowServer(): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: '1.0.0' },
    { capabilities: { tools: {} } },
  )

  server.registerTool('open_window', {
    description: '打开一个 beaver 能力包窗口。如发朋友圈可打开 moment 窗口，改设置打开 settings 窗口。',
    inputSchema: {
      name: z.string().describe('窗口名，可用 list_windows 查询当前已启用的窗口'),
    },
  }, async (args) => {
    const target = String(args.name || '')
    const app = getPluginApplication(target)
    if (!app) {
      return {
        content: [{ type: 'text', text: `窗口不可用或插件未启用: ${target || '(empty)'}。可用：${getPluginWindowNames().join(', ')}` }],
        isError: true,
      }
    }
    try {
      app.createBrowserWindow()
      logger.info({ text: 'MCP 开窗', data: { name: target } })
      return { content: [{ type: 'text', text: `已打开 ${target} 窗口` }] }
    }
    catch (err: any) {
      return {
        content: [{ type: 'text', text: `开窗失败: ${err?.message || String(err)}` }],
        isError: true,
      }
    }
  })

  server.registerTool('list_windows', {
    description: '列出当前已启用插件实际注册的窗口入口名。',
    inputSchema: {},
  }, async () => {
    return { content: [{ type: 'text', text: `可用窗口：${getPluginWindowNames().join(', ')}` }] }
  })

  return server
}
