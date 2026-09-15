/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 宿主动态运行时（原 process.custom，bindMain 时注入） */
export interface IHostCustom {
  env: 'prod' | 'test' | 'dev'
  tools: boolean
  deviceId: string
  version: string
  platform: string
}
