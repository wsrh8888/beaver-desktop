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
import conversationReceiver from './conversation-receiver'
import messageMediaReceiver from './message-media-receiver'
import messageReceiver from './message-receiver'
import userConversationReceiver from './user-conversation-receiver'

/**
 * 聊天消息路由器
 * 根据消息类型路由到对应的接收器
 */
class ChatMessageRouter {
  private messageReceiver = messageReceiver
  private conversationReceiver = conversationReceiver
  private userConversationReceiver = userConversationReceiver
  private messageMediaReceiver = messageMediaReceiver

  /**
   * 处理聊天消息
   * @param wsMessage WebSocket 消息内容
   */
  async processChatMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      logger.warn({ text: '聊天消息缺少 type 字段', data: { wsMessage } }, 'ChatMessageRouter')
      return
    }

    switch (data.type) {
      // 消息发送相关的更新 - 聚合消息，包含所有表的更新，同时调用三个receiver
      case 'chat_conversation_message_receive':
        await this.messageReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 会话相关的更新 - 只调用会话receiver
      case 'chat_conversation_meta_receive':
        await this.conversationReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 用户会话相关的更新 - 只调用用户会话receiver
      case 'chat_user_conversation_receive':
        await this.userConversationReceiver.handleTableUpdates(wsMessage.data.body)
        break

      case 'chat_message_media_receive':
        await this.messageMediaReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        logger.warn({ text: '未知的聊天消息类型', data: { type: data.type } }, 'ChatMessageRouter')
    }
  }
}

// 导出单例实例
export default new ChatMessageRouter()
