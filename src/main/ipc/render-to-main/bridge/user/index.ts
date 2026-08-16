import type { IBeaverBridgeResult } from 'commonModule/type/preload/bridge'
import type { IBridgeSession } from 'mainModule/bridge/registry'
import { store } from 'mainModule/store'

class BridgeUserHandler {
  handle(action: string, _params: Record<string, unknown>, _session: IBridgeSession): IBeaverBridgeResult {
    switch (action) {
      case 'getUserInfo': {
        const session = store.get('userInfo')
        const userId = session?.userId || ''
        if (!userId)
          return { code: 401, msg: 'not logged in', result: null }

        const detail = store.get('allUser')?.[userId]
        return {
          code: 0,
          msg: 'ok',
          result: {
            userId,
            nickName: detail?.nickName || '',
            avatar: detail?.avatar || '',
          },
        }
      }
      default:
        return { code: 1, msg: `unknown user action: ${action}`, result: null }
    }
  }
}

export default new BridgeUserHandler()
