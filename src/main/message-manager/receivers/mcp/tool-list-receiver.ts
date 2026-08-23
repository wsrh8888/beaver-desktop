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
import { registerToolApi } from 'mainModule/api/mcp.js'
import logger from 'mainModule/utils/log/index.js'

/**
 * @description: MCP工具列表接收器 - 处理工具列表注册请求
 */
class ToolListReceiver {
  /**
   * 处理工具列表注册请求
   * 只处理 messages 表的更新（遵循项目模式）
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { requestId, clientId } = tableUpdatesBody

    logger.info({
      text: `注册MCP工具列表`,
      data: { requestId, clientId }
    })

    // 获取本地所有工具
    const tools = mcpManager.getAllTools()

    // 通过HTTP API注册工具列表到云端
    try {
      await registerToolApi({ tools })
      logger.info({
        text: `工具列表已注册到云端`,
        data: { requestId, clientId, toolCount: tools.length }
      })
    } catch (error) {
      logger.error({
        text: `注册工具列表到云端失败`,
        error
      })
    }
  }
}

export default new ToolListReceiver()