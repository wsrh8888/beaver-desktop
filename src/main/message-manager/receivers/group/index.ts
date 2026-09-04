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

import groupReceiver from './group'
import groupJoinRequestReceiver from './group-join-request-receiver'
import groupMemberReceiver from './group-member-receiver'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('GroupMessageRouter')

/**
 * @description: 群组消息路由器
 * 根据消息类型路由到对应的接收器
 */
class GroupMessageRouter {
  private groupReceiver = groupReceiver
  private groupJoinRequestReceiver = groupJoinRequestReceiver
  private groupMemberReceiver = groupMemberReceiver

  /**
   * 处理群组消息
   * @param wsMessage WebSocket 消息内容
   */
  async processGroupMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      logger.warn({ text: '群组消息缺少 type 字段', data: { command: wsMessage?.command } })
      return
    }

    switch (data.type) {
      // 群组信息同步
      case 'group_receive':
        logger.info({ text: '收到群组信息同步消息' })
        await this.groupReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 群成员添加请求
      case 'group_join_request_receive':
        logger.info({ text: '收到群成员添加请求消息' })
        await this.groupJoinRequestReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 群成员变动
      case 'group_member_receive':
        logger.info({ text: '收到群成员变动消息' })
        await this.groupMemberReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        logger.warn({ text: '未知的群组消息类型', data: { type: data.type } })
    }
  }
}

// 导出单例实例
export default new GroupMessageRouter()
