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

import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationNotificationCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入通知模块的通知处理器
import inboxNotificationManager from './inbox'

const logger = new Logger('通知模块通知路由器')
/**
 * @description: 通知模块通知路由器
 */
class NotificationNotificationRouter {
  /**
   * 处理通知模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_NOTIFICATION>) {
    logger.info({
      text: '收到通知模块通知',
      data: params,
    })
    switch (params.command) {
      case NotificationNotificationCommand.INBOX_UPDATE:
        await inboxNotificationManager.processInboxUpdate(params.data)
        break
      case NotificationNotificationCommand.READ_CURSOR_UPDATE:
        await inboxNotificationManager.processInboxUpdate({ source: 'business' })
        break
      default:
        logger.warn({ text: '未知的通知命令', data: { command: params.command } })
    }
  }
}

export const notificationNotificationRouter = new NotificationNotificationRouter()
