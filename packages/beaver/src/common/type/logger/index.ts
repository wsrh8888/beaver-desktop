/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 插件可见的日志消息形状 */
export interface ILogger {
  [key: string]: any
  text: string
  data?: any | object
}
