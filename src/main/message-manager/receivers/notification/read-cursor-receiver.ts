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

import notificationReadCursorBusiness from 'mainModule/business/notification/read-cursor'
const readCursorBusiness = notificationReadCursorBusiness

/**
 * @description: 通知已读游标接收器 - 处理notification_read_cursor表的操作
 */
class ReadCursorReceiver {
  /**
   * 处理通知已读游标更新通知
   * 只处理 notification_read_cursor 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 处理notification_read_cursor表的更新
    for (const update of tableUpdates) {
      if (update.table === 'notification_read_cursor') {
        // 第三层循环：遍历data数组中的每个版本数据
        for (const dataItem of update.data) {
          if (update.userId && dataItem?.version) {
            await readCursorBusiness.handleTableUpdates(dataItem.version, update.userId, dataItem.category)
          }
        }
      }
    }
  }
}

export default new ReadCursorReceiver()
