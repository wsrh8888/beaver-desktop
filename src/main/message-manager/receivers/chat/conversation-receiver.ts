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
import Logger from 'mainModule/utils/logger'
const logger = new Logger('conversation-receiver')


/**
 * @description: 会话接收器 - 处理conversations表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
class ConversationReceiver {
  /**
   * 处理会话更新通知
   * 只处理 conversations 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    logger.info({ text: 'handleTableUpdates 开始' })
    const { tableUpdates } = tableUpdatesBody

    // 第一层循环：遍历所有的表更新
    for (const update of tableUpdates) {
      // 第二层循环：在switch中处理每种表类型
      switch (update.table) {
        case 'conversations':
          // 第三层循环：遍历data数组中的每个版本数据
          for (const dataItem of update.data) {
            if (update.conversationId && dataItem?.version) {
              await conversationBusiness.syncConversationByVersion(update.conversationId, dataItem.version)
            }
          }
          break

        // 可以扩展处理其他表，但这里只负责conversations
        default:
          // 不处理其他表的更新
          break
      }
    }
  }
}

export default new ConversationReceiver()
