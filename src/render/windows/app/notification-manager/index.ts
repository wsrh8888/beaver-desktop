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

import { NotificationModule } from 'commonModule/type/preload/notification'

// 导入各个子模块的通知路由器
import { appNotificationRouter } from './app/index'
import { callNotificationRouter } from './call/index'
import { chatNotificationRouter } from './chat/index'
import { circleNotificationRouter } from './circle/index'
import { emojiNotificationRouter } from './emoji/index'
import { friendNotificationRouter } from './friend/index'
import { groupNotificationRouter } from './group/index'
import { notificationNotificationRouter } from './notification/index'
import { userNotificationRouter } from './user/index'
import Logger from 'renderModule/utils/logger';
const logger = new Logger('index')


/**
 * @description: 通知管理中心 - 统一入口，委托给子模块处理
 */
class NotificationManager {
  init() {
    logger.info({ text: 'init 开始' })
    // 设置全局通知监听器，委托给各个子模块的路由器处理
    electron.notification.on(NotificationModule.APP_LIFECYCLE, params => appNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_CHAT, params => chatNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.EMOJI, params => emojiNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_FRIEND, params => friendNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_GROUP, params => groupNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_CIRCLE, params => circleNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_NOTIFICATION, params => notificationNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_USER, params => userNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.CALL, params => callNotificationRouter.handleNotification(params))
  }

  off() {
    logger.info({ text: 'off 开始' })
    // 移除全局通知监听器
    electron.notification.off(NotificationModule.APP_LIFECYCLE, params => appNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_CHAT, params => chatNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.EMOJI, params => emojiNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_FRIEND, params => friendNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_GROUP, params => groupNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_CIRCLE, params => circleNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_NOTIFICATION, params => notificationNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_USER, params => userNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.CALL, params => callNotificationRouter.handleNotification(params))
  }
}

export default new NotificationManager()
