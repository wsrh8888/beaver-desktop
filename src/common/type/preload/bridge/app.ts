import type { IBeaverBridgeResult } from './result'

export interface IBeaverBridgeAppInfo {
  env: string
  deviceId: string
}

export interface IBeaverBridgeAppModule {
  getEnv: () => Promise<IBeaverBridgeResult<IBeaverBridgeAppInfo>>
}
