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
