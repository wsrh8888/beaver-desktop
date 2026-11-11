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

/** 插件清单（宿主按名单加载） */
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

/** 主进程插件模块约定：唯一允许的导出形状 */
export interface IMainPluginModule {
  manifest: IPluginManifest
  activate: (ctx: IMainActivateContext) => void | Promise<void>
  application?: Application
  extraApplications?: Record<string, Application>
}

/** 插件可自注册的同步模块 */
export interface IDataSyncModule {
  checkAndSync: () => Promise<void>
}

/** 平台注入给插件 preload 工厂的调用口：事件通道归宿主，插件只认 command */
export interface IPluginInvoke {
  invoke: <T = unknown>(command: string, data?: unknown) => Promise<T>
  on: (channel: string, callback: (event: unknown, ...args: any[]) => void) => void
  off: (channel: string, callback: (event: unknown, ...args: any[]) => void) => void
}

/** 插件通过 contextBridge 暴露的方法集合 */
export interface IPluginApi {
  [method: string]: (...args: any[]) => unknown
}

/** 每个插件 preload 入口的唯一导出 */
export type IPluginPreloadFactory = (ipc: IPluginInvoke) => IPluginApi
