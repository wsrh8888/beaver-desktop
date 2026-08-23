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

import Logger from 'renderModule/utils/logger'
import { useMessageStore } from '../../pinia/message/message'
import { useConversationStore } from '../../pinia/conversation/conversation'
import { useMessageViewStore } from '../../pinia/view/message'

const logger = new Logger('DatabaseChatMessageEventManager')

class DatabaseChatMessageEventManager {
  /**
   * 处理未读数更新和自动标记已读
   */
  private async handleUnreadAndReadStatus(conversationId: string) {
    const conversationStore = useConversationStore()

    // 更新未读数
    conversationStore.updateTrayUnreadItems()
    const messageViewStore = useMessageViewStore()
    if (messageViewStore.currentChatId === conversationId) {
      await conversationStore.markConversationAsRead(conversationId)
      logger.info({
        text: `当前会话收到新消息，已自动标记已读: conversation=${conversationId}`,
      })
    }
  }

  /**
   * 处理消息表更新通知
   */
  async processMessageUpdate(data: any) {
    const { conversationId, seq, message, messageId, sendStatus } = data

    logger.info({
      text: '收到消息表更新通知',
      data: { conversationId, seq, messageId, sendStatus },
    })

    try {
      const messageStore = useMessageStore()

      // 情况1：主进程直接推过来完整的消息对象 (新消息发送或实时接收)
      if (message) {
        messageStore.addMessage(conversationId, message)
      }
      // 情况2：仅状态变更 (如超时失败、ACK 成功)
      else if (messageId && sendStatus !== undefined) {
        messageStore.addMessage(conversationId, { messageId, sendStatus } as any)
      }
      // 情况3：仅有 seq，说明需要从本地库同步 (通常是后台拉取后的增量同步)
      else if (seq !== undefined) {
        await messageStore.fetchMessagesBySeqRange(conversationId, seq, seq)
      }

      // 后续处理 (未读数等)
      setTimeout(async () => {
        await this.handleUnreadAndReadStatus(conversationId)
      }, 50)
    }
    catch (error) {
      logger.error({
        text: '处理消息表更新失败',
        data: { conversationId, error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseChatMessageEventManager()
