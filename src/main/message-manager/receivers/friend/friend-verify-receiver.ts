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
import friendVerifyBusiness from 'mainModule/business/friend/friend-verify'
import userBusiness from 'mainModule/business/user/user'
import Logger from 'mainModule/utils/logger'
const logger = new Logger('friend-verify-receiver')


/**
 * @description: 好友验证接收器 - 处理friend_verify表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
class FriendVerifyReceiver {
  /**
   * 处理好友验证表更新通知
   * 处理 friend_verify 表和 users 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    logger.info({ text: 'handleTableUpdates 开始' })
    const { tableUpdates } = tableUpdatesBody

    // 过滤出 friend_verify 的更新
    const friendVerifyUpdates = tableUpdates.filter((update: any) => update.table === 'friend_verify')

    // 过滤出 friends 的更新
    const friendUpdates = tableUpdates.filter((update: any) => update.table === 'friends')

    // 过滤出 users 的更新
    const userUpdates = tableUpdates.filter((update: any) => update.table === 'users')

    // 处理好友验证更新
    for (const update of friendVerifyUpdates) {
      // update.data 是数组，需要遍历每个数据项
      for (const dataItem of update.data) {
        // 使用business的队列处理机制，避免频繁请求
        await friendVerifyBusiness.handleTableUpdates(dataItem.userId, dataItem.verifyId, dataItem.version)
      }
    }

    // 处理好友关系更新
    for (const update of friendUpdates) {
      // update.data 是数组，需要遍历每个数据项
      for (const dataItem of update.data) {
        // 使用business的队列处理机制，避免频繁请求
        await friendBusiness.handleTableUpdates(dataItem.version, dataItem.friendId)
      }
    }

    // 处理用户更新
    for (const update of userUpdates) {
      // update.data 是数组，需要遍历每个数据项
      for (const dataItem of update.data) {
        // 使用用户business处理用户信息更新，userId在dataItem中
        await userBusiness.handleTableUpdates(dataItem.userId, dataItem.version)
      }
    }
  }
}

export default new FriendVerifyReceiver()
