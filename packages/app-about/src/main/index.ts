/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-about 主进程出口（application + activate + manifest） */

export { activate } from './activate'
export { default as application } from './application/about'
export { default as aboutApplication } from './application/about'
export { aboutManifest as manifest, aboutManifest } from './manifest'
