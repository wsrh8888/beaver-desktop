/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { aiPanelNotificationRouter } from 'renderModule/components/business/aiPanel/notification-manager'

/**
 * @description: 本机工具确认的转发口
 *
 * 服务端下发 client_tool 后，主进程把需要人表态的调用（agent 代发消息、删文件等）
 * 转成 MCP_CONFIRM 通知推到这里。AI 面板是独立业务组件，怎么入队、卡片长什么样、
 * 点完怎么回传，全由它自己的 notification-manager 决定，这里只转一手。
 */
class McpNotificationRouter {
  async handleNotification(params: INotificationPayload<NotificationModule.MCP_CONFIRM>) {
    aiPanelNotificationRouter.handleConfirm({
      command: params.command,
      data: params.data,
    })
  }
}

export const mcpNotificationRouter = new McpNotificationRouter()
