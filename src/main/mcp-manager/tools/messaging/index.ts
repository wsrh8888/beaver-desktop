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
 * 消息相关的MCP工具
 */
import { z } from 'zod'

export const messagingTools = [
  {
    name: 'send_text_message',
    description: '发送文本消息给好友或群聊',
    inputSchema: z.object({
      conversation_id: z.string().describe('会话ID（好友ID或群聊ID）'),
      content: z.string().describe('消息内容')
    }),
    handler: async (params) => {
      // 这里实现发送消息的逻辑
      return {
        success: true,
        message_id: 'msg_' + Date.now(),
        conversation_id: params.conversation_id,
        content: params.content,
        timestamp: new Date().toISOString()
      }
    }
  }
]
