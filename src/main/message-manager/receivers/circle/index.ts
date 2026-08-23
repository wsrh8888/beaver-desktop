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

import circleReceiver from './circle'

/**
 * @description: 圈子消息路由器
 */
class CircleMessageRouter {
  private circleReceiver = circleReceiver

  async processCircleMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      console.warn('圈子消息缺少 type 字段', wsMessage)
      return
    }

    switch (data.type) {
      case 'circle_receive':
        await this.circleReceiver.handleTableUpdates(wsMessage.data.body)
        break
      default:
        console.warn('未知的圈子消息类型', data.type)
    }
  }
}

export default new CircleMessageRouter()
