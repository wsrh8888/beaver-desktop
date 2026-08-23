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

import { WebSocketCommand } from 'commonModule/type/ipc/command'
import logger from 'mainModule/utils/log'
import wsManager from 'mainModule/ws-manager'
import chatHandler from './chat'

const loggerName = 'websocket-handler'

class WebSocketHandler {
  /**
   * 处理WebSocket相关的IPC命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: WebSocketCommand, data: any = {}): Promise<unknown> {
    try {
      switch (command) {
        case WebSocketCommand.DISCONNECT:
          wsManager.disconnect()
          return true

        case WebSocketCommand.RECONNECT:
          logger.info({ text: 'IPC收到重连请求' }, loggerName)
          // 重新连接WebSocket
          wsManager.disconnect()
          await wsManager.connect()
          return true

        case WebSocketCommand.SEND_CHAT_MESSAGE:
          return await chatHandler.handle(_event, data?.command, data?.data)
      }
    }
    catch (error) {
      logger.error({ text: 'WebSocket命令处理失败', data: { command, error } }, loggerName)
      throw error
    }
  }
}

export default new WebSocketHandler()
