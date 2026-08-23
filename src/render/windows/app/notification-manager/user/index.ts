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
import { NotificationUserCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入用户模块的通知处理器
import userNotificationManager from './user'

const logger = new Logger('用户模块通知路由器')

/**
 * @description: 用户模块通知路由器
 */
class UserNotificationRouter {
  /**
   * 处理用户模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_USER>) {
    logger.info({
      text: '收到用户模块通知',
      data: params,
    })
    switch (params.command) {
      case NotificationUserCommand.USER_UPDATE:
        await userNotificationManager.processUserUpdate(params.data)
        break
      default:
        console.warn('未知的用户通知命令:', params.command)
    }
  }
}

export const userNotificationRouter = new UserNotificationRouter()
