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
 * 打开图片查看器窗口工具
 */
import { z } from 'zod'

export const openImageWindowTool = {
  name: 'open_image_window',
  description: '打开图片查看器窗口，用于显示和浏览图片文件。支持图片缩放、旋转、保存等操作。当用户需要查看图片详情、浏览相册或处理图片文件时使用此工具。',
  inputSchema: z.object({
    imageUrl: z.string().optional().describe('图片文件的URL地址或本地路径。如果不提供，将打开空的图片查看器窗口'),
    imageId: z.string().optional().describe('图片的唯一标识ID，用于关联数据库中的图片记录'),
    windowTitle: z.string().optional().default('图片查看器').describe('窗口标题，默认为"图片查看器"'),
    allowDownload: z.boolean().optional().default(true).describe('是否允许下载图片，默认为true'),
    allowShare: z.boolean().optional().default(true).describe('是否允许分享图片，默认为true')
  }),
  handler: async (params: {
    imageUrl?: string
    imageId?: string
    windowTitle?: string
    allowDownload?: boolean
    allowShare?: boolean
  }) => {
    // 这里实现打开图片窗口的逻辑
    console.log('打开图片窗口:', params)
    return {
      success: true,
      windowType: 'image',
      imageUrl: params.imageUrl,
      imageId: params.imageId,
      windowTitle: params.windowTitle || '图片查看器',
      features: {
        download: params.allowDownload ?? true,
        share: params.allowShare ?? true
      },
      message: `成功打开图片查看器窗口${params.imageUrl ? `，显示图片: ${params.imageUrl}` : ''}`
    }
  }
}
