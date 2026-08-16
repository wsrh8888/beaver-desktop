import type { IBeaverBridgeAppModule } from 'commonModule/type/preload/bridge'
import bridgeInvokeManager from 'preloadModule/utils/bridgeInvoke'

export const appModule: IBeaverBridgeAppModule = {
  getEnv: () => bridgeInvokeManager.invoke('app.getEnv'),
}
