/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { ILogger } from '../../../common/type/logger'
import { getMainRuntime } from '../../bind'

/** 主进程 Logger 门面（对齐原 mainModule/utils/logger，实现由宿主 bind） */
export default class Logger {
  logName: string

  constructor(name = '') {
    this.logName = name
  }

  info = (msg: ILogger) => {
    this.sendLog('info', msg)
  }

  warn = (msg: ILogger) => {
    this.sendLog('warn', msg)
  }

  error = (msg: ILogger) => {
    this.sendLog('error', msg)
  }

  sendLog = (level: 'info' | 'warn' | 'error', msg: ILogger) => {
    getMainRuntime().logger.send(level, msg, this.logName)
  }
}
