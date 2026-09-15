/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import Logger from '../logger'

const logger = new Logger('WindowInit')

/** 渲染窗口全局错误 / 网络监听 */
export function initWindow(): void {
  window.addEventListener('online', () => {
    logger.info({ text: '网络已连接' })
  })

  window.addEventListener('offline', () => {
    logger.error({ text: '网络已断开' })
  })

  window.onerror = (message, source, lineno, colno, error) => {
    logger.error({
      text: '未捕获的全局错误',
      data: {
        message: String(message),
        source,
        lineno,
        colno,
        error: (error as Error)?.message,
      },
    })
  }

  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason
    logger.error({
      text: '未处理的 Promise 拒绝',
      data: {
        reason: reason instanceof Error ? reason.message : String(reason),
      },
    })
  }
}
