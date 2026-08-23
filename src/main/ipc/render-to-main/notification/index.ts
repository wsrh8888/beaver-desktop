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

import type { SystemNotificationOptions } from 'commonModule/type/preload/notification'
import { NotificationCommand } from 'commonModule/type/ipc/command'
import trayHandler from 'mainModule/application/tray'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import notificationManager from 'mainModule/notification'
import logger from 'mainModule/utils/log'

class NotificationHandler {
  /**
   * 统一的notification处理入口
   */
  handle(_event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: NotificationCommand | string, data: any): any {
    logger.info({
      text: '收到notification消息', data: {
        command,
        data,
      }
    }, 'NotificationHandler')

    switch (command) {
      case NotificationCommand.Send:
        sendMainNotification(data.targetName, data.module, data.command, data.payload)
        break
      case NotificationCommand.ShowSystemNotification:
        notificationManager.show(data as SystemNotificationOptions)
        break
      case NotificationCommand.UpdateTray:
        trayHandler.updateMenu(data?.menuItems)
        break
      case NotificationCommand.DeleteTrayItem:
        trayHandler.deleteMenuItem(data)
        break
      default:
        console.error(`notification处理未知命令: ${command}`)
    }
  }
}

export default new NotificationHandler()
