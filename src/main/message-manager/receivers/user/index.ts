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

import userReceiver from './user'

/**
 * @description: 用户消息路由器
 * 根据消息类型路由到对应的接收器
 */
class UserMessageRouter {
  private userReceiver = userReceiver

  /**
   * 处理用户消息
   * @param wsMessage WebSocket 消息内容
   */
  async processUserMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      console.warn('用户消息缺少 type 字段', wsMessage)
      return
    }

    switch (data.type) {
      // 用户资料同步
      case 'user_receive':
        await this.userReceiver.handleTableUpdates(data.body)
        break

      default:
        console.warn('未知的用户消息类型', data.type)
    }
  }
}

// 导出单例实例
export default new UserMessageRouter()
