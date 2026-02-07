import type { ElectronAPP } from 'commonModule/type/preload'

import { contextBridge } from 'electron'

import { appModule } from './core/app'
import { authModule } from './core/auth'
import { cacheModule } from './core/cache'
import { databaseModule } from './core/database'
import { datasyncModule } from './core/datasync'
import { loggerModule } from './core/logger'
import { notificationModule } from './core/notification'
import { storageModule } from './core/storage'
import { updateModule } from './core/update'
import { websocketModule } from './core/websocket'
import { windowModule } from './core/window'
import { callModule } from './core/call'

// Define the new electron API structure
const electronAPI: ElectronAPP = {
  logger: loggerModule,
  window: windowModule,
  call: callModule,
  app: appModule,
  storage: storageModule,
  update: updateModule,
  cache: cacheModule,
  websocket: websocketModule,
  database: databaseModule,
  notification: notificationModule,
  auth: authModule,
  datasync: datasyncModule,
}

// Expose the new API structure to the main world
contextBridge.exposeInMainWorld('electron', electronAPI)
