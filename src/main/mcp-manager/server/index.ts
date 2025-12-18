import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import express from 'express'
import cors from 'cors'
import sseTransportManager from './sse/transport.js'
import healthHandler from './health-handler.js'

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
      console.log(`MCP server listening on port ${port}`)
    })

    console.log('MCP server started successfully')
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
