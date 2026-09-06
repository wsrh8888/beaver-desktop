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

import notificationInboxBusiness from 'mainModule/business/notification/inbox'
import Logger from 'mainModule/utils/logger'
const logger = new Logger('inbox-receiver')

const inboxBusiness = notificationInboxBusiness

/**
 * @description: 通知收件箱接收器 - 处理notification_inbox表的操作
 */
class InboxReceiver {
  /**
   * 处理通知收件箱更新通知
   * 只处理 notification_inbox 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    logger.info({ text: 'handleTableUpdates 开始' })
    const { tableUpdates } = tableUpdatesBody

    // 处理notification_inbox表的更新
    for (const update of tableUpdates) {
      if (update.table === 'notification_inbox') {
        // 第三层循环：遍历data数组中的每个版本数据
        for (const dataItem of update.data) {
          if (update.userId && dataItem?.version && dataItem?.eventId) {
            await inboxBusiness.handleTableUpdates(dataItem.version, dataItem.eventId, update.userId)
          }
        }
      }
    }
  }
}

export default new InboxReceiver()
