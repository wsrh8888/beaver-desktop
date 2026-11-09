/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-doc 主进程出口（窗口 application + 插件清单 + activate） */
export { activate } from './activate'
export { default as application } from './application/doc'
export { default as docApplication } from './application/doc'
export { docManifest as manifest, docManifest } from './manifest'
