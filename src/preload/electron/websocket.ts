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

import type { IWebSocketModule } from 'commonModule/type/preload/websocket'
import { WebSocketCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'
import { WebsocketCommand } from 'commonModule/type/ipc/websocket'

export const websocketModule: IWebSocketModule = {
  // 连接WebSocket
  connect: async (userId: string, deviceId: string): Promise<boolean> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.CONNECT, { userId, deviceId })
  },

  // 断开WebSocket连接
  disconnect: async (): Promise<void> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.DISCONNECT)
  },

  // 重新连接WebSocket
  reconnect: async (): Promise<boolean> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.RECONNECT)
  },

  chat: {
    sendMessage: async (data: any): Promise<boolean> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.SEND_CHAT_MESSAGE, {
        command: WebsocketCommand.MESSAGE_SEND,
        data,
      })
    },
  },
}
