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

import { LoggerCommand } from 'commonModule/type/ipc/command'
import logger from 'mainModule/utils/log'

/**
 * 渲染进程日志的落盘端。
 * 注意：这里必须直接使用 Log 单例，不能用 Logger 类 —— Logger 类把 source 固定为 'main'，
 * 而日志需要标记来源为 'render'，否则无法区分主进程/渲染进程日志。
 */
class LoggerHandler {
  /** 支持的日志级别，用于拦截非法 level 避免 logger[level] 为 undefined 导致崩溃 */
  private static readonly SUPPORTED_LEVELS = ['info', 'warn', 'error']

  /**
   * 统一的日志处理入口
   */
  handle(event: Electron.IpcMainEvent, command: LoggerCommand, data: any) {
    switch (command) {
      case LoggerCommand.LOG:
        this.handleLog(data)
        break
      default:
        logger.warn({ text: '收到未知的日志命令', data: { command } }, 'LoggerHandler', 'main')
    }
  }

  /**
   * 处理日志记录
   */
  private handleLog(data: any) {
    const { level, message, moduleName } = data

    if (!LoggerHandler.SUPPORTED_LEVELS.includes(level)) {
      logger.warn({ text: '收到不支持的日志级别', data: { level, moduleName } }, 'LoggerHandler', 'main')
      return
    }

    logger[level](message, moduleName, 'render')
  }
}

export default new LoggerHandler()
