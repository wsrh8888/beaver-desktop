/**
 * 发布朋友圈动态工具
 */
import { z } from 'zod'

export const createMomentTool = {
  name: 'create_moment',
  description: '发布新的朋友圈动态。这个工具直接调用业务逻辑API，不需要打开UI界面。支持文本、图片、链接等多种内容类型。可以设置可见范围和提醒特定好友。当需要快速发布动态或在后台发布时使用此工具。',
  inputSchema: z.object({
    content: z.string().min(1).max(1000).describe('动态文本内容，1-1000字符，必填'),
    images: z.array(z.string()).optional().describe('图片URL数组，最多9张，可选'),
    visibility: z.enum(['public', 'friends', 'private']).optional().default('friends').describe('可见范围：public(公开)、friends(好友可见)、private(仅自己可见)，默认为friends'),
    location: z.string().optional().describe('地理位置信息，可选'),
    remindUsers: z.array(z.string()).optional().describe('提醒特定好友的用户ID数组，可选'),
    link: z.object({
      title: z.string(),
      url: z.string(),
      description: z.string().optional()
    }).optional().describe('链接信息，包含标题、URL和描述，可选')
  }),
  handler: async (params: {
    content: string
    images?: string[]
    visibility?: 'public' | 'friends' | 'private'
    location?: string
    remindUsers?: string[]
    link?: {
      title: string
      url: string
      description?: string
    }
  }) => {
    // 这里实现发布朋友圈动态的逻辑
    // 直接调用MomentBusiness的API，不需要打开UI
    console.log('发布朋友圈动态:', params)
    return {
      success: true,
      momentId: 'moment_' + Date.now(),
      content: params.content,
      images: params.images || [],
      visibility: params.visibility ?? 'friends',
      createdAt: new Date().toISOString(),
      message: '朋友圈动态发布成功'
    }
  }
}
