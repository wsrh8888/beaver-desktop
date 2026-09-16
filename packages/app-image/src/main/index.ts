/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-image 主进程出口（application + activate + manifest） */

export { activate } from './activate'
export { default as application } from './application/image'
export { default as imageApplication } from './application/image'
export { imageManifest as manifest, imageManifest } from './manifest'
