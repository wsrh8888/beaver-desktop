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

import { store } from 'mainModule/store'
import type { IChatMessageSendBody } from 'commonModule/type/ws/message-types'
import { WebsocketCommand } from 'commonModule/type/ipc/websocket'
import messageBusiness from 'mainModule/business/chat/message'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('WebsocketChatHandler')

class ChatHandler {
  /**
   * 处理聊天相关的 IPC 命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: WebsocketCommand, data: any): Promise<any> {
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }

    try {
      switch (command) {
        case WebsocketCommand.MESSAGE_SEND:
          return await this.messageSend(data as IChatMessageSendBody, userStore.userId)
        default:
          throw new Error('聊天消息命令处理失败')
      }
    }
    catch (error) {
      logger.error({ text: '处理聊天消息失败', data: { command, error: (error as Error)?.message } })
      return { code: -1, msg: (error as Error).message }
    }
  }

  /**
   * @description: 发送消息核心业务处理 (转发给 Business 层)
   */
  private async messageSend(data: IChatMessageSendBody, userId: string): Promise<any> {
    return await messageBusiness.sendMessage(userId, data)
  }
}

export default new ChatHandler()
