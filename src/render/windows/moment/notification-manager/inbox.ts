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
import { NotificationModule, NotificationNotificationCommand } from 'commonModule/type/preload/notification'
import { useMomentNotificationStore } from '../store/notification/notification'
import { useMomentStore } from '../store/moment/moment'

class MomentInboxNotificationManager {
  init() {
    electron?.notification.on(NotificationModule.DATABASE_NOTIFICATION, this.handleNotification)
  }

  off() {
    electron?.notification.off(NotificationModule.DATABASE_NOTIFICATION, this.handleNotification)
  }

  handleNotification = async (params: INotificationPayload<NotificationModule.DATABASE_NOTIFICATION>) => {
    switch (params.command) {
      case NotificationNotificationCommand.INBOX_UPDATE:
      case NotificationNotificationCommand.READ_CURSOR_UPDATE: {
        const notificationStore = useMomentNotificationStore()
        const momentStore = useMomentStore()
        await notificationStore.handleInboxUpdate()
        await momentStore.refreshMoments()
        break
      }
      default:
        break
    }
  }
}

export default new MomentInboxNotificationManager()
