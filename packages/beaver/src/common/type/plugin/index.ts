/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { Application } from '../app/application'
import type { IStore } from '../mainStore'

/** 远程/可下载插件元信息 */
export interface IPluginInfo {
  name: string
  description: string
  version: string
  url: string
  inject: number
}

/** 能力包清单（宿主按名单加载） */
export interface IPluginManifest {
  id: string
  name: string
  version: string
  description?: string
}

/** 主进程 activate 时宿主注入的能力子集 */
export interface IMainActivateContext {
  store: IStore
  getDirname: () => string
  createLogger: (name?: string) => {
    info: (msg: { text: string, data?: any }) => void
    warn: (msg: { text: string, data?: any }) => void
    error: (msg: { text: string, data?: any }) => void
  }
}

/** 主进程插件模块约定 */
export interface IMainPluginModule {
  manifest: IPluginManifest
  activate?: (ctx: IMainActivateContext) => void | Promise<void>
  deactivate?: () => void | Promise<void>
  application?: Application
}
