import type {
  IWorkbenchEmbedBounds,
  IWorkbenchEmbedStatePayload,
  IWorkbenchModule,
} from 'commonModule/type/preload/workbench'
import { WORKBENCH_EMBED_STATE_CHANNEL } from 'commonModule/type/main/web-contents-view/workbench'
import { WorkbenchCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const workbenchModule: IWorkbenchModule = {
  openEmbed: (data) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_OPEN, data)
  },
  hideAllEmbeds: () => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_HIDE_ALL, {})
  },
  setEmbedBounds: (data: { tabId: string, bounds: IWorkbenchEmbedBounds }) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_SET_BOUNDS, data)
  },
  reloadEmbed: (data: { tabId: string }) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_RELOAD, data)
  },
  closeEmbed: (data: { tabId: string }) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_CLOSE, data)
  },
  openExternal: (data: { url: string }) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.OPEN_EXTERNAL, data)
  },
  onEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => {
    ipcRenderManager.on(WORKBENCH_EMBED_STATE_CHANNEL, callback)
  },
  offEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => {
    ipcRenderManager.removeListener(WORKBENCH_EMBED_STATE_CHANNEL, callback)
  },
}
