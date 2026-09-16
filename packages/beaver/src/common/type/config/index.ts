/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

export interface IConfig {
  baseUrl: string
  openAppId: string
  env: string
  /** 原始日志 Bucket，对应 log */
  logId: string
}

export interface IConfigs {
  [key: string]: IConfig
}

/** 宿主动态运行时（原 process.custom，bindMain 时注入） */
export interface IHostCustom {
  env: 'prod' | 'test' | 'dev'
  tools: boolean
  deviceId: string
  version: string
  platform: string
  /** 可选，来自 config.ini 的 baseUrl 覆盖 */
  baseUrl?: string
}
