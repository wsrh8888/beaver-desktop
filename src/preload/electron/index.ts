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
}

contextBridge.exposeInMainWorld('electron', electronAPI)
