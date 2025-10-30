import { NotificationCommand } from 'commonModule/type/ipc/command'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'

export class NotificationHandler {
  /**
   * 统一的notification处理入口
   */
  static handle(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: NotificationCommand | string, data: any): any {
    logger.info({ text: '收到notification消息', data: {
      command,
      data,
    } }, 'NotificationHandler')

    switch (command) {
      case NotificationCommand.Send:
        sendMainNotification(data.targetName, data.module, data.command, data.payload)
        break
      default:
        console.error(`notification处理未知命令: ${command}`)
    }
  }
}
