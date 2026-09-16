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
export { BaseService } from './database'
export { registerDataSync, getRegisteredDataSync } from './datasync/registry'
export type { IDataSyncModule } from '../common/type/plugin'
export { registerWsHandler, getWsHandler } from './ws/registry'
export type { WsMessageHandler } from './ws/registry'
export { registerDatabaseIpcHandler, getDatabaseIpcHandler, registerIpcHandler, getIpcHandler } from './ipc/registry'
export type { DatabaseIpcHandler, IpcHandler } from './ipc/registry'
export {
  registerBridgeSession,
  unregisterBridgeSession,
  getBridgeSession,
} from './bridge/registry'
export type { IBridgeSession } from './bridge/registry'
export { registerKeyboardBinding, setKeyboardBindingHandler } from './keyboard/registry'
export type { KeyboardBindingHandler } from './keyboard/registry'
export { registerTableInit, getRegisteredTableInits } from './database/table-init-registry'
export type { TableInitFn } from './database/table-init-registry'
export {
  registerConversationDisplayProvider,
  getConversationDisplayProviders,
  resolveConversationDisplays,
} from './conversation/display-registry'
export type {
  IConversationRef,
  IConversationDisplay,
  IConversationDisplayProvider,
} from './conversation/display-registry'
export { default as ApplicationBase } from './application/base'
