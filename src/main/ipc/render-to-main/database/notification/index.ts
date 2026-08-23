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

import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { DataNotificationCommand } from 'commonModule/type/ipc/database'
import notificationInboxBusiness from 'mainModule/business/notification/inbox'
import notificationReadCursorBusiness from 'mainModule/business/notification/read-cursor'
import notificationEventBusiness from 'mainModule/business/notification/event'
import { store } from 'mainModule/store'

class NotificationHandler {
  async handle(_event: Electron.IpcMainInvokeEvent, command: DataNotificationCommand, data: any, header: ICommonHeader): Promise<any> {
    const userInfo = store.get('userInfo')
    const userId = header.userId || userInfo?.userId
    if (!userId)
      throw new Error('用户未登录')

    switch (command) {
      case DataNotificationCommand.GET_EVENTS_BY_IDS:
        return await notificationEventBusiness.getByIds(data?.eventIds || [])
      case DataNotificationCommand.GET_INBOX_BY_IDS:
        return await notificationInboxBusiness.getByEventIds(userId, data?.eventIds || [])
      case DataNotificationCommand.GET_INBOX_BY_CATEGORY:
        return await notificationInboxBusiness.getInboxByCategory(userId, data?.category || '', data?.limit)
      case DataNotificationCommand.GET_READ_CURSORS:
        return await notificationReadCursorBusiness.getCursors(userId, data?.categories)
      case DataNotificationCommand.GET_UNREAD_SUMMARY:
        return await notificationInboxBusiness.getUnreadSummary(userId, data?.categories)
      default:
        throw new Error('通知数据库命令处理失败NotificationHandler')
    }
  }
}

export default new NotificationHandler()
