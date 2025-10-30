import type { INotificationModule, INotificationPayload, NotificationCommandMap, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'mainModule/utils/preload/ipcRender'

/**
 * @description: 通知模块
 */
export const notificationModule: INotificationModule = {
  on: <M extends NotificationModule>(module: M, callback: (payload: INotificationPayload<M>) => void) => {
    ipcRenderManager.on(module, (_event: any, payload: INotificationPayload<M>) => {
      callback(payload)
    })
  },
  off: <M extends NotificationModule>(module: M, callback: (payload: INotificationPayload<M>) => void) => {
    ipcRenderManager.removeListener(module, callback)
  },
  /**
   * 发送通知到主进程，让主进程转发到指定渲染进程或广播
   * @param targetName - 窗口名称（ 表示广播到全部）
   * @param module - 通知模块
   * @param command - 通知命令
   * @param payload - 通知数据
   */
  send: <M extends NotificationModule>(targetName: string, module: M, command: NotificationCommandMap[M], payload?: any) => {
    ipcRenderManager.send(IEvent.RenderToMain, NotificationCommand.Send, { targetName, module, command, payload })
  },

}
