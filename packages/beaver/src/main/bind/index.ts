/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { AjaxFn, IHostCustom, ILogger, IStore } from '@beaver-im/beaver'

export type LogLevel = 'info' | 'warn' | 'error'

/**
 * 宿主注入的主进程运行时（对齐 preload 的 electronAPI 模块树，而不是打平一袋函数）。
 * 门面层（logger/store/config/...）只读这里对应子对象。
 */
export interface MainRuntime {
  logger: {
    send: (level: LogLevel, msg: ILogger, logName: string) => void
  }
  store: IStore
  config: {
    /** 宿主主进程资源根（拼 preload / dist） */
    dirname: string
    /** 宿主动态运行时（原 process.custom，每次读取最新值） */
    getCustom: () => IHostCustom
  }
  database: {
    /** 当前用户库 drizzle 实例（未 init 时应抛错） */
    getDb: () => any
  }
  request: {
    ajax: AjaxFn
  }
  ipc: {
    sendMainNotification: (targetName: string, module: string, command: string, payload?: any) => void
  }
}

let runtime: MainRuntime | null = null

export function bindMain(next: MainRuntime): void {
  runtime = next
}

export function getMainRuntime(): MainRuntime {
  if (!runtime) {
    throw new Error('[@beaver-im/beaver] main API 尚未 bind，请在宿主主进程启动早期调用 bindMain()')
  }
  return runtime
}

export function isMainBound(): boolean {
  return runtime !== null
}
