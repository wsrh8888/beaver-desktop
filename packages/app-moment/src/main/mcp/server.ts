/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 朋友圈 MCP server（in-process）。用 McpServer.registerTool 注册工具：
 *   - tools/list 由 SDK 据 zod schema 自动生成给 LLM
 *   - tools/call 调 dispatchMoment 路由执行，结果包成 MCP { content: [{ type: 'text', text }] }
 * 工具全名 `moment__{tool}`，宿主 McpHost.callTool 据此分发到本 server。
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
  commentMomentSchema,
  getMomentDetailSchema,
  likeMomentSchema,
  listMomentsSchema,
  openMomentSchema,
  postMomentSchema,
} from './tools'
import { dispatchMoment } from './handlers'

export function createMomentServer(): McpServer {
  const server = new McpServer(
    { name: 'moment', version: '1.0.0' },
    { capabilities: { tools: {} } },
  )

  const tools: Record<string, { description: string, inputSchema: Record<string, any> }> = {
    open_moment: { description: '打开朋友圈窗口。需要用户在界面查看朋友圈时调用。', inputSchema: openMomentSchema },
    list_moments: { description: '列出朋友圈动态。返回每条的 id、作者、内容、点赞数、评论数。', inputSchema: listMomentsSchema },
    post_moment: { description: '发布一条朋友圈（纯文本）。发图需先上传文件拿到 fileKey 再带 files。', inputSchema: postMomentSchema },
    get_moment_detail: { description: '查看单条朋友圈详情（含最新评论/点赞）。', inputSchema: getMomentDetailSchema },
    like_moment: { description: '对一条朋友圈点赞或取消点赞。', inputSchema: likeMomentSchema },
    comment_moment: { description: '评论一条朋友圈。可回复某条评论（带 parentId）。', inputSchema: commentMomentSchema },
  }

  for (const [name, config] of Object.entries(tools)) {
    server.registerTool(name, {
      description: config.description,
      inputSchema: config.inputSchema,
    }, async (args) => {
      try {
        const text = await dispatchMoment(name, (args || {}) as Record<string, any>)
        return { content: [{ type: 'text', text }] }
      }
      catch (err: any) {
        return {
          content: [{ type: 'text', text: err?.message || '执行失败' }],
          isError: true,
        }
      }
    })
  }

  return server
}
