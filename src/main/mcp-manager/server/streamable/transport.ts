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

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import type { IncomingMessage, ServerResponse } from 'http'

/**
 * StreamableHTTP传输管理器
 * 管理StreamableHTTP连接（为将来扩展保留）
 */
class StreamableTransportManager {
  private transport: StreamableHTTPServerTransport | null = null

  /**
   * 处理StreamableHTTP请求
   */
  async handleRequest(req: IncomingMessage, res: ServerResponse, body?: any): Promise<void> {
    try {
      // 创建或重用StreamableHTTP传输
      if (!this.transport) {
        this.transport = new StreamableHTTPServerTransport()
      }

      await this.transport.handleRequest(req as any, res as any, body)
    } catch (error) {
      console.error('StreamableHTTP request handling error:', error)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Internal server error' }))
      }
    }
  }

  /**
   * 清理传输
   */
  async cleanup(): Promise<void> {
    if (this.transport) {
      // StreamableHTTP传输通常不需要显式关闭
      this.transport = null
    }
  }
}

export default new StreamableTransportManager()