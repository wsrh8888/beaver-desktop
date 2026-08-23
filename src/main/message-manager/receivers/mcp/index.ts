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

import logger from 'mainModule/utils/log'
import toolExecutionReceiver from './tool-execution-receiver'
import toolListReceiver from './tool-list-receiver'

/**
 * @description: MCP消息路由器
 * 根据消息类型路由到对应的接收器
 */
class MCPMessageRouter {
  private toolExecutionReceiver = toolExecutionReceiver
  private toolListReceiver = toolListReceiver

  /**
   * 处理MCP消息
   * @param wsMessage WebSocket 消息内容
   */
  async processMCPMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      logger.warn({ text: 'MCP消息缺少 type 字段', data: { wsMessage } }, 'MCPMessageRouter')
      return
    }

    switch (data.type) {
      // 工具执行请求
      case 'tool_execution':
        await this.toolExecutionReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 工具列表注册请求
      case 'tool_list_register':
        await this.toolListReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        logger.warn({ text: '未知的MCP消息类型', data: { type: data.type } }, 'MCPMessageRouter')
    }
  }
}

// 导出单例实例
export default new MCPMessageRouter()
