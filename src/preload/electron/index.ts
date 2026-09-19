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
import { createAgentModule } from '@beaver-im/app-ai/preload'
import { createSettingsModule } from '@beaver-im/app-settings/preload'
import { createWorkbenchModule } from '@beaver-im/app-workbench/preload'
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
 * 业务包只描述自己的命令。事件通道留在宿主。
 * 这份 preload 被每个子窗口共用，所以 agent 不限于 AI 窗口。
 * 工作台内嵌网页走 bridge.mjs，不挂这些能力。
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

const electronAPI: ElectronAPP = {
  logger: loggerModule,
  window: windowModule,
  call: callModule,
  keyboard: keyboardModule,
  settings: createSettingsModule(ipc),
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
  workbench: createWorkbenchModule(ipc),
  fs: fsModule,
  agent: createAgentModule(ipc),
}

contextBridge.exposeInMainWorld('electron', electronAPI)
