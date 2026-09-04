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

import friendVerifyReceiver from './friend-verify-receiver'
import friendReceiver from './receiver'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('FriendMessageRouter')

/**
 * @description: 好友消息路由器
 * 根据消息类型路由到对应的接收器
 */
class FriendMessageRouter {
  private friendReceiver = friendReceiver
  private friendVerifyReceiver = friendVerifyReceiver

  /**
   * 处理好友消息
   * @param wsMessage WebSocket 消息内容
   */
  async processFriendMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      logger.warn({ text: '好友消息缺少 type 字段', data: { command: wsMessage?.command } })
      return
    }

    switch (data.type) {
      // 好友信息同步
      case 'friend_receive':
        logger.info({ text: '收到好友信息同步消息' })
        await this.friendReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 好友验证信息同步
      case 'friend_verify_receive':
        logger.info({ text: '收到好友验证信息同步消息' })
        await this.friendVerifyReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        logger.warn({ text: '未知的好友消息类型', data: { type: data.type } })
    }
  }
}

// 导出单例实例
export default new FriendMessageRouter()
