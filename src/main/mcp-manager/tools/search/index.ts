/**
 * 搜索相关的MCP工具
 */
import { z } from 'zod'

export const searchTools = [
  {
    name: 'search_contacts',
    description: '搜索联系人（好友和群聊）',
    inputSchema: z.object({
      keyword: z.string().describe('搜索关键词'),
      type: z.enum(['all', 'friends', 'groups']).default('all').describe('搜索类型')
    }),
    handler: async (params) => {
      // 这里实现搜索联系人的逻辑
      return {
        success: true,
        keyword: params.keyword,
        type: params.type || 'all',
        results: [],
        total_found: 0
      }
    }
  }
]
