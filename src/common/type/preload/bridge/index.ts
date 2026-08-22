import type { IBeaverBridgeAppModule } from './app'
import type { IBeaverBridgeUserModule } from './user'

export type { IBeaverBridgeResult } from './result'
export type { IBeaverBridgeAppInfo, IBeaverBridgeAppModule } from './app'
export type { IBeaverBridgeUserInfo, IBeaverBridgeUserModule } from './user'

/**
 * @description: 内嵌页 JSBridge（按能力分模块，勿暴露完整 electron API）
 */
export interface IBeaverBridge {
  app: IBeaverBridgeAppModule
  user: IBeaverBridgeUserModule
}
