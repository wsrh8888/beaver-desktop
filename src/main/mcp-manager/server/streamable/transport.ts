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