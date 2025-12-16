/**
 * 消息相关的MCP工具
 */
export const messagingTools = [
  {
    name: 'send_text_message',
    description: '发送文本消息给好友或群聊',
    inputSchema: {
      type: 'object',
      properties: {
        conversation_id: {
          type: 'string',
          description: '会话ID（好友ID或群聊ID）'
        },
        content: {
          type: 'string',
          description: '消息内容'
        }
      },
      required: ['conversation_id', 'content']
    },
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
