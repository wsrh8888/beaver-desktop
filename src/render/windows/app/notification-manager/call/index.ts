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

import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationModule, NotificationCallCommand } from 'commonModule/type/preload/notification'
import Logger from 'renderModule/utils/logger'
import callNotificationManager from './call'

const logger = new Logger('通话模块通知路由器')

/**
 * @description: 通话模块通知路由器
 */
class CallNotificationRouter {
  /**
   * 处理通话模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.CALL>) {
    logger.info({
      text: '收到通话模块通知',
      data: params,
    })

    switch (params.command) {
      case NotificationCallCommand.CALL_INVITE:
        await callNotificationManager.processCallInvite(params.data)
        break
      case NotificationCallCommand.CALL_ENDED:
        callNotificationManager.processCallEnded(params.data)
        break
      default:
        logger.warn({ text: '未知的通话通知命令', data: { command: params.command } })
    }
  }
}

export const callNotificationRouter = new CallNotificationRouter()
