/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import type { IncomingMessage, ServerResponse } from 'http'
import type { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'

/**
 * SSE消息处理器
 * 处理SSE协议的消息收发
 */
class SSEMessageHandler {
  /**
   * 处理SSE消息请求
   */
   async handleMessage(
    transports: Map<string, SSEServerTransport>,
    sessionId: string,
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    try {
      const transport = transports.get(sessionId)

      if (!transport) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'No transport found for sessionId' }))
        return
      }

      await transport.handlePostMessage(req, res, (req as any).body)
    } catch (error) {
      console.error('SSE message handling error:', error)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Message handling failed' }))
      }
    }
  }

  /**
   * 获取消息处理函数
   */
   getMessageHandler(transports: Map<string, SSEServerTransport>): (req: any, res: any) => Promise<void> {
    return async (req: any, res: any) => {
      const sessionId = req.query.sessionId as string
      await this.handleMessage(transports, sessionId, req, res)
    }
  }
}


export default new SSEMessageHandler()