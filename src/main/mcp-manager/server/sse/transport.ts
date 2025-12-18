import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import type { IncomingMessage, ServerResponse } from 'http'
import { SSEMessageHandler } from './message-handler.js'

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
    return SSEMessageHandler.getMessageHandler(this.transports)
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
