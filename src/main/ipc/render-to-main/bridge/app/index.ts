import type { IBeaverBridgeResult } from 'commonModule/type/preload/bridge'
import type { IBridgeSession } from 'mainModule/bridge/registry'

class BridgeAppHandler {
  handle(action: string, _params: Record<string, unknown>, _session: IBridgeSession): IBeaverBridgeResult {
    switch (action) {
      case 'getEnv':
        return {
          code: 0,
          msg: 'ok',
          result: {
            env: process.custom?.ENV || 'prod',
            deviceId: process.custom?.DEVICE_ID || '',
          },
        }
      default:
        return { code: 1, msg: `unknown app action: ${action}`, result: null }
    }
  }
}

export default new BridgeAppHandler()
