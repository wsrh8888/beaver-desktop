/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-moment 主进程出口（窗口 application + 插件清单 + activate） */
export { activate } from './activate'
export { default as application } from './application/moment'
export { default as momentApplication } from './application/moment'
export { momentManifest as manifest, momentManifest } from './manifest'
