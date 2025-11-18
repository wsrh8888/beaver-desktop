import type { NotificationCommandMap, NotificationModule } from 'commonModule/type/preload/notification'
import { BrowserWindow } from 'electron'
import logger from 'mainModule/utils/log'

/**
 * 主进程到渲染进程的通知模块
 * 类似于渲染进程的notificationModule.send()的反向操作
 */

/**
 * 主进程发送通知到渲染进程
 * 参数与 preload/notificationModule.send 完全一致
 * @param targetName - 目标窗口名称，'*'表示广播到所有窗口
 * @param module - 通知模块
 * @param command - 通知命令
 * @param payload - 通知数据（可选）
 */
export function sendMainNotification<M extends NotificationModule>(
  targetName: string,
  module: M,
  command: NotificationCommandMap[M],
  payload?: any,
) {
  logger.info({
    text: '主进程发送通知到渲染进程',
    data: { targetName, module, command, payload },
  }, 'sendMainNotification')

  if (targetName === '*' || !targetName) {
    // 广播到所有渲染进程
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => {
      if (window.webContents) {
        window.webContents.send(module, {
          command,
          data: payload,
        })
      }
    })
  }
  else {
    // 发送到指定窗口
    const windows = BrowserWindow.getAllWindows()
    const targetWindow = windows.find(win =>
      (win as any).__appName === targetName,
    )

    if (targetWindow) {
      targetWindow.webContents.send(module, {
        command,
        data: payload,
      })
    }
    else {
      logger.warn({ text: '未找到目标窗口', data: { targetName } }, 'sendMainNotification')
    }
  }
}
