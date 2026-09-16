/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/beaver — 官方包（share 契约 + 主/渲染门面）
 *
 *   .          — common 层：插件契约类型 + 运行时 config
 *   ./main     — 主进程门面（仍需 bindMain）
 *   ./renderer — 渲染进程门面（直接打 electron.xxx，无需 bind）
 */

// ── 插件契约类型 ──
export type { Application } from './common/type/app/application'
export type { IPluginManifest, IMainActivateContext, IMainPluginModule, IDataSyncModule } from './common/type/plugin'

// ── Store 契约 ──
export type { IStore, IStoreOptions, IStoreUserInfo } from './common/type/mainStore'

// ── Ajax 契约 ──
export type { AjaxFn, IAjaxRequestConfig, IAjaxResponse } from './common/type/ajax'
export type { ICommonHeader } from './common/type/ajax/common'

// ── Config 契约 ──
export type { IConfig, IConfigs, IHostCustom } from './common/type/config'

// ── 运行时 config 值（运行时从 process.custom / electron.app 读取环境） ──
export { baseUrl, openAppId, logId, getCurrentConfig, getBaseUrl, getOpenAppId, getLogId } from './common/config'
