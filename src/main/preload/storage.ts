import type { IStoreOptions } from 'commonModule/type/mainStore'
import type { IStorageModule } from 'commonModule/type/preload/storage'
import { StorageCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'mainModule/utils/preload/ipcRender'

export const storageModule: IStorageModule = {
  getAsync: (key: string, options?: IStoreOptions) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, StorageCommand.GET, { key, options })
  },
  setAsync: (key: string, value: any, options?: IStoreOptions) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, StorageCommand.SET, { key, value, options })
  },
  removeAsync: (key: string) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, StorageCommand.REMOVE, { key })
  },
}
