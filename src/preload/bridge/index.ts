import type { IBeaverBridge } from 'commonModule/type/preload/bridge'
import { contextBridge } from 'electron'
import { appModule } from './app'
import { userModule } from './user'

const beaverBridge: IBeaverBridge = {
  app: appModule,
  user: userModule,
}

contextBridge.exposeInMainWorld('beaverBridge', beaverBridge)
