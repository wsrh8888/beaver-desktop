import type { IBeaverBridgeResult } from 'commonModule/type/preload/bridge'
import { BridgeCommand } from 'commonModule/type/ipc/command'
import bridgeRegistry from 'mainModule/bridge/registry'
import logger from 'mainModule/utils/log'
import appHandler from './app'
import userHandler from './user'

class BridgeHandler {
  handle(
    event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: BridgeCommand | string,
    data: { method?: string, params?: Record<string, unknown> } = {},
  ): IBeaverBridgeResult | void {
    if (command !== BridgeCommand.INVOKE) {
      logger.error({ text: `bridge 未知命令: ${command}` }, 'BridgeHandler')
      return { code: 1, msg: `unknown command: ${command}`, result: null }
    }

    const session = bridgeRegistry.get(event.sender.id)
    if (!session || (session.win && session.win.isDestroyed())) {
      return { code: 1, msg: 'bridge context not found', result: null }
    }

    const method = typeof data?.method === 'string' ? data.method : ''
    const params = data?.params && typeof data.params === 'object' ? data.params : {}
    const [moduleName, action = ''] = method.split('.')

    switch (moduleName) {
      case 'app':
        return appHandler.handle(action, params, session)
      case 'user':
        return userHandler.handle(action, params, session)
      default:
        logger.error({ text: `bridge 未知模块: ${method}` }, 'BridgeHandler')
        return { code: 1, msg: `unknown method: ${method}`, result: null }
    }
  }
}

export default new BridgeHandler()
