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

import conversationBusiness from 'mainModule/business/chat/conversation'
import messageBusiness from 'mainModule/business/chat/message'
import userConversationBusiness from 'mainModule/business/chat/user-conversation'

/**
 * @description: 消息接收器 - 处理messages表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
class MessageReceiver {
  /**
   * 处理消息更新通知
   * 只处理 messages 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 第一层循环：遍历所有的表更新
    for (const update of tableUpdates) {
      // 第二层循环：在switch中处理每种表类型
      switch (update.table) {
        case 'messages':
          // 第三层循环：遍历data数组中的每个版本数据
          for (const dataItem of update.data) {
            if (update.conversationId && dataItem?.seq) {
              await messageBusiness.syncMessagesByVersion(update.conversationId, dataItem.seq)
            }
          }
          break

        case 'conversations':
          // 第三层循环：遍历data数组中的每个版本数据
          for (const dataItem of update.data) {
            if (update.conversationId && dataItem?.version) {
              await conversationBusiness.syncConversationByVersion(update.conversationId, dataItem.version)
            }
          }
          break

        case 'user_conversations':
          // 对于聚合消息中的用户会话更新，也使用队列处理
          for (const dataItem of update.data) {
            if (update.userId && update.conversationId && dataItem?.version) {
              await userConversationBusiness.handleTableUpdates(update.userId, update.conversationId, dataItem.version)
            }
          }
          break

        default:
          // 忽略未知表的更新
          break
      }
    }
  }
}

export default new MessageReceiver()
