import type { IBeaverBridgeResult } from 'commonModule/type/preload/bridge'
import { BridgeCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

class BridgeInvokeManager {
  /**
   * 内嵌页 JSBridge 统一调用主进程
   * 通过 BridgeCommand.INVOKE 转发 method / params
   * @param method - 能力方法名，形如 app.getEnv
   * @param params - 方法参数
   */
  invoke<T = unknown>(
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<IBeaverBridgeResult<T>> {
    return ipcRenderManager.invoke<IBeaverBridgeResult<T>>(
      IEvent.RenderToMainSyncMsg,
      BridgeCommand.INVOKE,
      { method, params },
    )
  }
}

export default new BridgeInvokeManager()
