/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-circle 主进程出口（窗口 application + business + database + datasync + receiver + ipc） */
export { default as circleApplication } from './application/circle'
export { initCircleTables } from './database/init/circle'
export { circleDatasync } from './datasync/circle'
export { default as circleMessageRouter } from './message-manager/receivers/circle'
export { default as circleHandler } from './ipc/render-to-main/database/circle'
export { default as dbServiceCircle } from './database/services/circle/circle'
export { circleManifest } from './manifest'
