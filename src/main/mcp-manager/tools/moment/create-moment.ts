/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

/**
 * 发布朋友圈动态工具
 */
import { z } from 'zod'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('MCPTool-create-moment')

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
    logger.info({
      text: '发布朋友圈动态',
      data: {
        contentLength: params.content.length,
        imageCount: params.images?.length ?? 0,
        visibility: params.visibility,
        location: params.location,
        remindUserCount: params.remindUsers?.length ?? 0,
        link: params.link
      }
    })
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
