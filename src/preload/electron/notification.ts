import type { INotificationModule, INotificationPayload, NotificationCommandMap, NotificationModule, SystemNotificationOptions, TrayUpdateOptions } from 'commonModule/type/preload/notification'
import { NotificationCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

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
  /**
   * 显示系统通知
   * @param options 通知选项
   */
  showSystemNotification: (options: SystemNotificationOptions) => {
    ipcRenderManager.send(IEvent.RenderToMain, NotificationCommand.ShowSystemNotification, options)
  },
  /**
   * 更新托盘菜单项列表
   * @param options 托盘更新选项，可以添加或更新消息项
   */
  updateTray: (options: TrayUpdateOptions) => {
    ipcRenderManager.send(IEvent.RenderToMain, NotificationCommand.UpdateTray, options)
  },
  /**
   * 删除托盘菜单项
   * @param id 要删除的消息项 ID
   */
  deleteTrayItem: (id: string) => {
    ipcRenderManager.send(IEvent.RenderToMain, NotificationCommand.DeleteTrayItem, id)
  },
}
