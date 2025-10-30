import type { IDownloadOptions, IUpdateModule } from 'commonModule/type/preload/update'
import { UpdateCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'mainModule/utils/preload/ipcRender'

// --- Update Module ---
export const updateModule: IUpdateModule = {
  // 保存之前的监听器引用
  previousHandler: null as any,

  // 下载更新，传入下载参数对象和进度回调
  downloadUpdate: (options: IDownloadOptions, onProgress: (progress: number) => void) => {
    // 先移除之前的监听器
    if (updateModule.previousHandler) {
      ipcRenderManager.removeListener(UpdateCommand.DOWNLOAD_PROGRESS, updateModule.previousHandler)
    }

    // 创建新的进度处理函数
    const progressHandler = (_: any, progress: number) => {
      onProgress(progress)

      // 进度100%或异常时自动移除监听器
      if (progress >= 100 || progress < 0) {
        ipcRenderManager.removeListener(UpdateCommand.DOWNLOAD_PROGRESS, progressHandler)
        updateModule.previousHandler = null
      }
    }

    // 保存新的监听器引用
    updateModule.previousHandler = progressHandler

    // 注册新的进度回调
    ipcRenderManager.on(UpdateCommand.DOWNLOAD_PROGRESS, progressHandler)

    // 开始下载，传递options参数
    ipcRenderManager.send(IEvent.RenderToMain, UpdateCommand.DOWNLOAD_UPDATE, options)
  },

  // 触发升级
  startUpdate: (options: IDownloadOptions) => {
    ipcRenderManager.send(IEvent.RenderToMain, UpdateCommand.START_UPDATE, options)
  },
}
