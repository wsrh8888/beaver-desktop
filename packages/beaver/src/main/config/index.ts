/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IHostCustom } from '../../common/type/config'
import { getMainRuntime } from '../bind'

/**
 * 宿主资源根目录（原 mainModule/config.__dirname）
 * 插件用它拼 preload、html 等路径。
 */
export function getDirname(): string {
  return getMainRuntime().config.dirname
}

/** API 根地址（原 commonModule/config.getBaseUrl） */
export function getBaseUrl(): string {
  return getMainRuntime().config.getBaseUrl()
}

/** 宿主动态运行时（原 process.custom） */
export function getCustom(): IHostCustom {
  return getMainRuntime().config.getCustom()
}
