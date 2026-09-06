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

import userConversationBusiness from 'mainModule/business/chat/user-conversation'
import Logger from 'mainModule/utils/logger'
const logger = new Logger('user-conversation-receiver')


/**
 * @description: 用户会话接收器 - 处理user_conversations表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
class UserConversationReceiver {
  /**
   * 处理用户会话更新通知
   * 只处理 user_conversations 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    logger.info({ text: 'handleTableUpdates 开始' })
    const { tableUpdates } = tableUpdatesBody

    // 过滤出只包含 user_conversations 的更新，逐个处理
    const userConversationUpdates = tableUpdates.filter((update: any) => update.table === 'user_conversations')

    for (const update of userConversationUpdates) {
      // 使用business的队列处理机制，避免频繁请求
      for (const dataItem of update.data) {
        if (update.userId && update.conversationId && dataItem?.version) {
          await userConversationBusiness.handleTableUpdates(update.userId, update.conversationId, dataItem.version)
        }
      }
    }
  }
}

export default new UserConversationReceiver()
