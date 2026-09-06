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

import friendBusiness from 'mainModule/business/friend/friend'
import Logger from 'mainModule/utils/logger'
const logger = new Logger('receiver')


/**
 * @description: 好友操作接收器 - 处理friends表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
class FriendReceiver {
  /**
   * 处理好友表更新通知
   * 只处理 friends 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    logger.info({ text: 'handleTableUpdates 开始' })
    const { tableUpdates } = tableUpdatesBody

    // 过滤出只包含 friends 的更新，逐个处理
    const friendUpdates = tableUpdates.filter((update: any) => update.table === 'friends')

    for (const update of friendUpdates) {
      // update.data 是数组，需要遍历每个数据项
      for (const dataItem of update.data) {
        // 使用business的队列处理机制，避免频繁请求
        await friendBusiness.handleTableUpdates(dataItem.version, dataItem?.friendId)
      }
    }
  }
}

export default new FriendReceiver()
