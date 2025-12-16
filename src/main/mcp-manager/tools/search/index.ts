/**
 * 搜索相关的MCP工具
 */
export const searchTools = [
  {
    name: 'search_contacts',
    description: '搜索联系人（好友和群聊）',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键词'
        },
        type: {
          type: 'string',
          enum: ['all', 'friends', 'groups'],
          description: '搜索类型',
          default: 'all'
        }
      },
      required: ['keyword']
    },
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
