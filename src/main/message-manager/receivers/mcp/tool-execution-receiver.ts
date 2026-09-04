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

import { mcpManager } from 'mainModule/mcp-manager/index.js'
import Logger from 'mainModule/utils/logger/index.js'

const logger = new Logger('MCPToolExecutionReceiver')

/**
 * @description: MCP工具执行接收器 - 处理云端转发过来的工具执行请求
 */
class ToolExecutionReceiver {
  /**
   * 处理工具执行请求
   * 只处理 messages 表的更新（遵循项目模式）
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { toolName, params, requestId, clientId } = tableUpdatesBody

    logger.info({
      text: '开始执行MCP工具',
      data: { toolName, requestId, clientId }
    })

    // 执行工具
    try {
      await mcpManager.executeTool(toolName, params)
      logger.info({
        text: 'MCP工具执行完成',
        data: { toolName, requestId, clientId }
      })
    } catch (error) {
      logger.error({
        text: 'MCP工具执行失败',
        data: { toolName, requestId, clientId, message: (error as Error)?.message, stack: (error as Error)?.stack }
      })
      throw error
    }
  }
}

export default new ToolExecutionReceiver()