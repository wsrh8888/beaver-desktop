import type { CacheType } from 'commonModule/type/cache/cache'
import type { ICacheModule } from 'commonModule/type/preload/cache'
import { CacheCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const cacheModule: ICacheModule = {
  // 获取缓存内容
  get: async (type: CacheType, fileKey: string): Promise<any> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, CacheCommand.GET, { type, fileKey })
  },

  // 设置缓存内容
  set: async (type: CacheType, fileKey: string): Promise<any> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, CacheCommand.SET, { type, fileKey })
  },
}
