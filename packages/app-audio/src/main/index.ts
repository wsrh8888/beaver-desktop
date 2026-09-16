/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-audio 主进程出口（application + activate + manifest） */

export { activate } from './activate'
export { default as application } from './application/audio'
export { default as audioApplication } from './application/audio'
export { audioManifest as manifest, audioManifest } from './manifest'
