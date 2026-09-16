/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-settings 主进程出口（application + activate + manifest + handler） */

export { activate } from './activate'
export { default as application } from './application/settings'
export { default as settingsApplication } from './application/settings'
export { settingsManifest as manifest, settingsManifest } from './manifest'
export { default as settingsHandler } from './ipc/render-to-main/settings'
export { SettingsCommand } from '../common/type/ipc/command'
