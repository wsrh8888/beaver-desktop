import type { ElectronAPP } from 'commonModule/type/preload'
import { appModule } from './app'
import { authModule } from './auth'
import { cacheModule } from './cache'
import { databaseModule } from './database'
import { loggerModule } from './logger'
import { notificationModule } from './notification'
import { storageModule } from './storage'
import { updateModule } from './update'
import { websocketModule } from './websocket'
import { windowModule } from './window'
const { contextBridge } = require('electron')

// Define the new electron API structure
const electronAPI: ElectronAPP = {
  logger: loggerModule,
  window: windowModule,
  app: appModule,
  storage: storageModule,
  update: updateModule,
  cache: cacheModule,
  websocket: websocketModule,
  database: databaseModule,
  notification: notificationModule,
  auth: authModule,

}

// Expose the new API structure to the main world
contextBridge.exposeInMainWorld('electron', electronAPI)
