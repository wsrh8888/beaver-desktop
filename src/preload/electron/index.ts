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
import { settingsModule } from './settings'
import { workbenchModule } from './workbench'
import { callModule } from './call'
import { fsModule } from './fs'

const electronAPI: ElectronAPP = {
  logger: loggerModule,
  window: windowModule,
  call: callModule,
  keyboard: keyboardModule,
  settings: settingsModule,
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
  workbench: workbenchModule,
  fs: fsModule,
}

contextBridge.exposeInMainWorld('electron', electronAPI)
