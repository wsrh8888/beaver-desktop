/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/beaver 渲染进程出口（直接依赖 electron.xxx，无需 bind） */
import './assets/style/index.less'

export { default as Logger } from './utils/logger'
export * from './utils/request'
export * from './utils/upload'
export * from './config'
export * from './user'
export * from './utils/init/window'
export * from './api/file'
