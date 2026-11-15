/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import type { ElectronAPP } from 'commonModule/type/preload'

import { contextBridge } from 'electron'
import { pluginPreloadFactories } from 'virtual:beaver-plugin-preloads'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

import { appModule } from './app'
import { authModule } from './auth'
import { cacheModule } from './cache'
import { clipboardModule } from './clipboard'
import { databaseModule } from './database'
import { datasyncModule } from './datasync'
import { loggerModule } from './logger'
import { notificationModule } from './notification'
import { storageModule } from './storage'
import { updateModule } from './update'
import { websocketModule } from './websocket'
import { windowModule } from './window'
import { keyboardModule } from './keyboard'
import { callModule } from './call'
import { fsModule } from './fs'

/**
 * 平台注入给插件的统一调用口：事件通道留在宿主，业务包只描述自己的 command。
 * 这份 preload 被每个子窗口共用；工作台内嵌网页走 bridge.mjs，不挂这些能力。
 */
const ipc = {
  invoke: <T = unknown>(command: string, data?: unknown) => {
    return ipcRenderManager.invoke<T>(IEvent.RenderToMainSyncMsg, command, data)
  },
  on: (channel: string, callback: (event: unknown, ...args: any[]) => void) => {
    ipcRenderManager.on(channel, callback)
  },
  off: (channel: string, callback: (event: unknown, ...args: any[]) => void) => {
    ipcRenderManager.removeListener(channel, callback)
  },
}

/**
 * 构建期清单决定有哪些插件：这里不出现任何业务包名字，也不引用它们的工厂。
 * 每个工厂返回自己的方法集合，按清单声明的命名空间挂到 electron 上。
 */
const pluginApis = Object.fromEntries(
  Object.entries(pluginPreloadFactories).map(([namespace, factory]) => [namespace, factory(ipc)]),
)

const electronAPI: ElectronAPP = {
  // 插件命名空间先展开；宿主能力后写，保证平台 API 不会被插件覆盖
  ...pluginApis,
  logger: loggerModule,
  window: windowModule,
  call: callModule,
  keyboard: keyboardModule,
  app: appModule,
  clipboard: clipboardModule,
  storage: storageModule,
  update: updateModule,
  cache: cacheModule,
  websocket: websocketModule,
  database: databaseModule,
  notification: notificationModule,
  auth: authModule,
  datasync: datasyncModule,
  fs: fsModule,
}

contextBridge.exposeInMainWorld('electron', electronAPI)
