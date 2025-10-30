import type { IWindowModule } from 'commonModule/type/preload/window'
import { WinHook } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'mainModule/utils/preload/ipcRender'

// --- Window Management Module ---
export const windowModule: IWindowModule = {
  closeWindow: (name?: string, options?: any) => {
    // 隐藏窗口到后台而不是关闭
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.CLOSE, { name, options })
  },
  openWindow: (name: string, options?: any) => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.OPEN_WINDOW, { name, options })
  },
  minimize: () => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.MINIMIZE)
  },
  maximize: () => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.MAXIMIZE)
  },
  restore: () => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.RESTORE)
  },
  toggleMaximize: () => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.MAXIMIZE)
  },
}
