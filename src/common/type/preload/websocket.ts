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

import type { IChatMessageSendBody } from '../ws/message-types'

/**
 * @description: WebSocket模块接口
 */
export interface IWebSocketModule {
  /**
   * @description: 连接WebSocket
   */
  connect(userId: string, deviceId: string): Promise<boolean>

  /**
   * @description: 断开WebSocket连接
   */
  disconnect(): Promise<void>

  /**
   * @description: 重新连接WebSocket
   */
  reconnect(): Promise<boolean>

  chat: {
    /**
     * @description: 发送聊天消息 (统一通道)
     */
    sendMessage(data: IChatMessageSendBody): Promise<boolean>
  }
}
