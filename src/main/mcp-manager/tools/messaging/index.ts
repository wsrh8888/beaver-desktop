/**
 * 消息相关的MCP工具
 */
import { z } from 'zod'

export const messagingTools = [
  {
    name: 'send_text_message',
    description: '发送文本消息给好友或群聊',
    inputSchema: z.object({
      conversation_id: z.string().describe('会话ID（好友ID或群聊ID）'),
      content: z.string().describe('消息内容')
    }),
    handler: async (params) => {
      // 这里实现发送消息的逻辑
      return {
        success: true,
        message_id: 'msg_' + Date.now(),
        conversation_id: params.conversation_id,
        content: params.content,
        timestamp: new Date().toISOString()
      }
    }
  }
]
