/**
 * 社交相关的MCP工具
 */
export const socialTools = [
  {
    name: 'get_friends_list',
    description: '获取当前用户的好友列表',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: '页码',
          default: 1,
          minimum: 1
        },
        limit: {
          type: 'number',
          description: '每页数量',
          default: 50,
          minimum: 1,
          maximum: 100
        }
      }
    },
    handler: async (params) => {
      // 这里实现获取好友列表的逻辑
      return {
        success: true,
        friends: [],
        total_count: 0
      }
    }
  }
]
