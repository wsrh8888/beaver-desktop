/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { ILogger } from '@packageCommon/type/logger'

function getElectron(): any {
  return (globalThis as any).electron || (globalThis as any).window?.electron
}

/** 渲染进程 Logger（直接走 preload electron.logger） */
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
    const conmmonLog = console[level]
    conmmonLog(level, JSON.stringify(msg))
    getElectron()?.logger?.[level]?.(msg, this.logName)
  }
}
