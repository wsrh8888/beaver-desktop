/**
 * 群聊相关的MCP工具
 */
import { z } from 'zod'

export const groupTools = [
  {
    name: 'get_groups_list',
    description: '获取当前用户加入的群聊列表',
    inputSchema: z.object({}),
    handler: async () => {
      // 这里实现获取群聊列表的逻辑
      return {
        success: true,
        groups: [],
        total_count: 0
      }
    }
  }
]
