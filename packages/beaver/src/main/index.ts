/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/beaver 主进程出口（按 mainModule 粒度分层后的聚合） */
export { bindMain, getMainRuntime, isMainBound } from './bind'
export type { MainRuntime, LogLevel } from './bind'
export { default as Logger } from './utils/logger'
export { store } from './store'
export { getDirname, getBaseUrl, getCustom } from './config'
export type { IHostCustom } from '../common/type/config'
export { ajax } from './utils/request'
export { sendMainNotification } from './ipc/main-to-render'
export { BaseService, dataSyncCursor } from './database'
export type { IDataSyncCursor } from './bind'
