import type { IAuthModule } from 'commonModule/type/preload/auth'
import { AuthCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const authModule: IAuthModule = {
  login: async () => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, AuthCommand.LOGIN)
  },
  logout: async () => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, AuthCommand.LOGOUT)
  },
}
