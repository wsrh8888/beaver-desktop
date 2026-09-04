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

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import express from 'express'
import cors from 'cors'
import sseTransportManager from './sse/transport.js'
import healthHandler from './health-handler.js'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('MCPServer')

/**
 * 本地MCP服务器
 */
class LocalMCPServer {
  private server: McpServer
  private httpServer: any = null

  constructor() {
    this.server = new McpServer({
      name: 'beaver-im-local-mcp',
      version: '1.0.0',
    })
    // 延迟导入，避免循环依赖
    import('../index.js').then(({ mcpManager }) => {
      // 注册工具
      const tools = mcpManager.getAllTools()
      for (const tool of tools) {
        this.server.registerTool(tool.name, {
          description: tool.description,
          inputSchema: tool.inputSchema,
        }, async (params: any) => {
          return await mcpManager.executeTool(tool.name, params)
        })
      }
    })
  }

  async start(port: number = 3001) {
    // 如果已经启动，先停止
    if (this.httpServer) {
      await this.stop()
    }

    const app = express()
    app.use(cors())
    app.use(express.json())

    // SSE路由
    app.get('/sse', sseTransportManager.getSSEHandler(this.server))
    app.post('/messages',  sseTransportManager.getMessageHandler())

    // 添加健康检查
    app.get('/health', healthHandler.handleHealthCheck)

    this.httpServer = app.listen(port, () => {
      logger.info({ text: 'MCP服务器开始监听', data: { port } })
    })

    logger.info({ text: 'MCP服务器启动成功', data: { port } })
  }



  async stop() {
    // 断开服务器连接
    await this.server.close()

    // 清理所有传输管理器
    await sseTransportManager.cleanup()

    // 关闭HTTP服务器
    if (this.httpServer) {
      this.httpServer.close()
      this.httpServer = null
    }
  }
}

// 导出单例实例
export const localMCPServer = new LocalMCPServer()
