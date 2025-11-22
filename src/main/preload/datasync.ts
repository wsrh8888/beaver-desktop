import type { IDatasyncModule } from 'commonModule/type/preload/datasync'
import { DataSyncCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'mainModule/utils/preload/ipcRender'

export const datasyncModule: IDatasyncModule = {
  // 手动触发数据同步
  manualSync: async (): Promise<boolean> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DataSyncCommand.MANUAL_SYNC)
  },
}
