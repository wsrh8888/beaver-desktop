import type { IDatasyncModule } from 'commonModule/type/preload/datasync'
import { DataSyncCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'mainModule/utils/preload/ipcRender'
import { AppLifecycleStatus } from 'commonModule/type/preload/notification'

export const datasyncModule: IDatasyncModule = {
  // 手动触发数据同步
  manualSync: async (): Promise<boolean> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DataSyncCommand.MANUAL_SYNC)
  },

  // 获取应用生命周期初始状态
  getAppLifecycleStatus: async (): Promise<{ status: AppLifecycleStatus }> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DataSyncCommand.GET_APP_LIFECYCLE_STATUS)
  },
}
