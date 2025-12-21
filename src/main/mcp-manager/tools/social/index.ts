/**
 * 社交相关的MCP工具
 */
import { z } from 'zod'

export const socialTools = [
  {
    name: 'get_friends_list',
    description: '获取当前用户的好友列表',
    inputSchema: z.object({
      page: z.number().min(1).default(1).describe('页码'),
      limit: z.number().min(1).max(100).default(50).describe('每页数量')
    }),
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
