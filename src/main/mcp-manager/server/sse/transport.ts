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

import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import type { IncomingMessage, ServerResponse } from 'http'
import sseMessageHandler from './message-handler.js'

/**
 * SSE传输管理器
 * 管理SSE连接的创建、清理和消息处理
 */
class SSETransportManager {
  private transports: Map<string, SSEServerTransport> = new Map()

  /**
   * 处理SSE连接请求
   */
  async handleSSEConnection(req: IncomingMessage, res: ServerResponse): Promise<SSEServerTransport> {
    try {
      console.log('SSE connection request established')
      console.log('Query parameters:', (req as any).query)

      // 创建SSE传输
      const transport = new SSEServerTransport('/messages', res)
      this.transports.set(transport.sessionId, transport)

      // 清理连接断开时的transport
      res.on('close', () => {
        this.transports.delete(transport.sessionId)
      })

      console.log(`SSE connection established with session ID: ${transport.sessionId}`)

      // 返回transport供服务器连接使用
      return transport
    } catch (error) {
      console.error('SSE connection error:', error)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'SSE connection failed' }))
      }
      throw error
    }
  }

  /**
   * 获取SSE连接处理函数
   */
  getSSEHandler(server: any): (req: any, res: any) => Promise<void> {
    return async (req: any, res: any) => {
      try {
        const transport = await this.handleSSEConnection(req, res)
        await server.connect(transport)
      } catch (error) {
        // 错误已在管理器中处理
      }
    }
  }

  /**
   * 获取消息处理函数
   */
  getMessageHandler(): (req: any, res: any) => Promise<void> {
    return sseMessageHandler.getMessageHandler(this.transports)
  }

  /**
   * 清理所有传输
   */
  async cleanup(): Promise<void> {
    for (const transport of this.transports.values()) {
      await transport.close()
    }
    this.transports.clear()
  }
}

export default new SSETransportManager()