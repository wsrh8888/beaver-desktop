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

import type loggerModule from 'mainModule/utils/log'
import { LoggerCommand } from 'commonModule/type/ipc/command'
import logger from 'mainModule/utils/log'

class LoggerHandler {
  /**
   * 统一的日志处理入口
   */
  handle(event: Electron.IpcMainEvent, command: LoggerCommand, data: any) {
    switch (command) {
      case LoggerCommand.LOG:
        this.handleLog(data)
        break
      default:
        console.error(`日志处理未知命令: ${command}`)
    }
  }

  /**
   * 处理日志记录
   */
  private handleLog(data: any) {
    const { level, message, moduleName } = data
    logger[level as keyof typeof loggerModule](message, moduleName, 'render')
  }
}

export default new LoggerHandler()
