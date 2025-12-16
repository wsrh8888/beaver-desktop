import type { IncomingMessage, ServerResponse } from 'http'
import type { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'

/**
 * SSE消息处理器
 * 处理SSE协议的消息收发
 */
export class SSEMessageHandler {
  /**
   * 处理SSE消息请求
   */
  static async handleMessage(
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
  static getMessageHandler(transports: Map<string, SSEServerTransport>): (req: any, res: any) => Promise<void> {
    return async (req: any, res: any) => {
      const sessionId = req.query.sessionId as string
      await SSEMessageHandler.handleMessage(transports, sessionId, req, res)
    }
  }
}
