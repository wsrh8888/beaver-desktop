/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/beaver 主进程出口（按 mainModule 粒度分层后的聚合） */
export * from './bind'
export { default as Logger } from './utils/logger'
export * from './store'
export * from './config'
/** 透出 common 契约类型；勿 `export type * from '@beaver-im/beaver'`，会与本模块 getBaseUrl 值导出冲突 */
export type * from '../common/type/app/application'
export type * from '../common/type/plugin'
export type * from '../common/type/mainStore'
export type * from '../common/type/ajax'
export type * from '../common/type/ajax/common'
export type * from '../common/type/config'
export type * from '../common/type/logger'
export * from './utils/request'
export * from './ipc/main-to-render'
export * from './database'
export * from './datasync/registry'
export * from './ws/registry'
export * from './ipc/registry'
export * from './bridge/registry'
export * from './keyboard/registry'
export * from './database/table-init-registry'
export * from './conversation/display-registry'
export * from './mcp/registry'
export { default as ApplicationBase } from './application/base'
