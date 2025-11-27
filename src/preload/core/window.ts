import type { IWindowModule, IWindowOpenOptions, IWinodwCloseOptions } from 'commonModule/type/preload/window'
import { WinHook } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

// --- Window Management Module ---
export const windowModule: IWindowModule = {
  closeWindow: (name?: string, options?: IWinodwCloseOptions) => {
    // 隐藏窗口到后台而不是关闭
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.CLOSE, { name, options })
  },
  openWindow: async (name: string, options?: IWindowOpenOptions): Promise<void> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WinHook.OPEN_WINDOW, { name, options })
  },
  minimize: () => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.MINIMIZE)
  },
  maximize: () => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.MAXIMIZE)
  },
}
