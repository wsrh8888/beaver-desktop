import type { ILogger } from 'commonModule/type/logger'
import { LoggerCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const loggerModule = {
  info: (data: ILogger, moduleName: string = '') => {
    ipcRenderManager.send(IEvent.RenderToMain, LoggerCommand.LOG, { level: 'info', message: data, moduleName })
  },
  error: (data: ILogger, moduleName: string = '') => {
    ipcRenderManager.send(IEvent.RenderToMain, LoggerCommand.LOG, { level: 'error', message: data, moduleName })
  },
  warn: (data: ILogger, moduleName: string = '') => {
    ipcRenderManager.send(IEvent.RenderToMain, LoggerCommand.LOG, { level: 'warn', message: data, moduleName })
  },
}
