import type { IBeaverBridgeUserModule } from 'commonModule/type/preload/bridge'
import bridgeInvokeManager from 'preloadModule/utils/bridgeInvoke'

export const userModule: IBeaverBridgeUserModule = {
  getUserInfo: () => bridgeInvokeManager.invoke('user.getUserInfo'),
}
