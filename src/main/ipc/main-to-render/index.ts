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

import type { NotificationCommandMap, NotificationModule } from 'commonModule/type/preload/notification'
import { BrowserWindow } from 'electron'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('sendMainNotification')

/**
 * 主进程到渲染进程的通知模块
 * 类似于渲染进程的notificationModule.send()的反向操作
 */

/**
 * 主进程发送通知到渲染进程
 * 参数与 preload/notificationModule.send 完全一致
 * @param targetName - 目标窗口名称，'*'表示广播到所有窗口
 * @param module - 通知模块
 * @param command - 通知命令
 * @param payload - 通知数据（可选）
 */
export function sendMainNotification<M extends NotificationModule>(
  targetName: string,
  module: M,
  command: NotificationCommandMap[M],
  payload?: any,
) {
  logger.info({
    text: '主进程发送通知到渲染进程',
    data: { targetName, module, command, payload },
  })

  if (targetName === '*' || !targetName) {
    // 广播到所有渲染进程
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => {
      if (window.webContents) {
        window.webContents.send(module, {
          command,
          data: payload,
        })
      }
    })
  }
  else {
    // 发送到指定窗口
    const windows = BrowserWindow.getAllWindows()
    const targetWindow = windows.find(win =>
      (win as any).__appName === targetName,
    )

    if (targetWindow) {
      targetWindow.webContents.send(module, {
        command,
        data: payload,
      })
    }
    else {
      logger.warn({ text: '未找到目标窗口', data: { targetName } })
    }
  }
}
