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
 * 搜索相关的MCP工具
 */
import { z } from 'zod'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('index')


export const searchTools = [
  {
    name: 'search_contacts',
    description: '搜索联系人（好友和群聊）',
    inputSchema: z.object({
      keyword: z.string().describe('搜索关键词'),
      type: z.enum(['all', 'friends', 'groups']).default('all').describe('搜索类型')
    }),
    handler: async (params) => {
    logger.info({ text: 'handler 开始' })
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
