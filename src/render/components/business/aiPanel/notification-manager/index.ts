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
 * AI 面板自己的推送入口，和 IM 的 notification-manager 同构：
 * 面板是走 ws 的小 IM，流式回复与确认请求都归它自己消化。
 *
 * 全局的 notification-manager 只做转发（DATABASE_CHAT / MCP_CONFIRM 各转一次），
 * 具体怎么处理、写哪个 store，全在这里，不再散落在 app 层。
 */
import { NotificationMcpConfirmCommand } from 'commonModule/type/preload/notification'
import Logger from 'renderModule/utils/logger'
import { handleConfirmCancel, handleConfirmRequest } from './confirm'
import { handleStream } from './stream'

const logger = new Logger('AiPanelNotification')

class AiPanelNotificationRouter {
  /** 流式增量；返回是否由面板消费 */
  handleStream(payload: Parameters<typeof handleStream>[0]): boolean {
    return handleStream(payload)
  }

  /** MCP 确认请求 / 撤回 */
  handleConfirm(params: { command: string, data?: any }): void {
    const data = params?.data
    switch (params?.command) {
      case NotificationMcpConfirmCommand.REQUEST_CONFIRM:
        handleConfirmRequest(data)
        break
      case NotificationMcpConfirmCommand.CANCEL_CONFIRM:
        handleConfirmCancel(data)
        break
      default:
        logger.warn({ text: '未知的 AI 确认命令', data: { command: params?.command } })
    }
  }
}

export const aiPanelNotificationRouter = new AiPanelNotificationRouter()
export { resolveConfirm } from './confirm'
