import type { SystemNotificationOptions } from 'commonModule/type/preload/notification'
import { NotificationCommand } from 'commonModule/type/ipc/command'
import trayHandler from 'mainModule/application/tray'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import notificationManager from 'mainModule/notification'
import logger from 'mainModule/utils/log'

class NotificationHandler {
  /**
   * 统一的notification处理入口
   */
  handle(_event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: NotificationCommand | string, data: any): any {
    logger.info({ text: '收到notification消息', data: {
      command,
      data,
    } }, 'NotificationHandler')

    switch (command) {
      case NotificationCommand.Send:
        sendMainNotification(data.targetName, data.module, data.command, data.payload)
        break
      case NotificationCommand.ShowSystemNotification:
        notificationManager.show(data as SystemNotificationOptions)
        break
      case NotificationCommand.UpdateTray:
        trayHandler.updateMenu(data?.menuItems)
        break
      case NotificationCommand.DeleteTrayItem:
        trayHandler.deleteMenuItem(data)
        break
      default:
        console.error(`notification处理未知命令: ${command}`)
    }
  }
}

export default new NotificationHandler()
