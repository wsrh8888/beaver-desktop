import type { SystemNotificationOptions } from 'commonModule/type/preload/notification'
import { BrowserWindow, Notification } from 'electron'
import logger from 'mainModule/utils/log'

/**
 * @description: 系统通知管理器
 */
class NotificationManager {
  /**
   * 显示系统通知
   * @param options 通知选项
   */
  show(options: SystemNotificationOptions): void {
    try {
      // 检查通知权限
      if (!Notification.isSupported()) {
        logger.warn({ text: '当前系统不支持通知' }, 'NotificationManager')
        return
      }

      // 检查权限状态（macOS 需要请求权限）
      if (process.platform === 'darwin') {
        // Electron 的 Notification API 在 macOS 上会自动处理权限
        // 如果权限未授予，通知会静默失败，不需要手动请求
      }

      // Windows 10+ 默认支持，但可能需要用户授权
      this.createNotification(options)
    }
    catch (error) {
      logger.error({
        text: '显示系统通知失败',
        data: { error: (error as Error).message },
      }, 'NotificationManager')
    }
  }

  /**
   * 创建并显示通知
   * Windows 10+ 会自动显示在通知中心（Action Center）
   */
  private createNotification(options: SystemNotificationOptions): void {
    const notification = new Notification({
      title: options.title,
      body: options.body,
      icon: options.icon,
      silent: options.silent ?? false,
      // Windows 10+ 会自动使用 Toast 通知并显示在通知中心
      // 不需要手动关闭，系统会自动管理
    })

    // 点击通知时的回调 - 默认打开应用窗口
    notification.on('click', () => {
      // 确保窗口显示在最前面
      const windows = BrowserWindow.getAllWindows()
      const appWindow = windows.find(win => (win as any).__appName === 'app')
      if (appWindow) {
        appWindow.show()
        appWindow.focus()
      }
    })

    // 显示通知
    // Windows 10+ 会自动将通知添加到通知中心
    notification.show()

    // macOS 会自动关闭通知
    // Windows 通知会保留在通知中心，用户可以手动清除
    // 不需要手动关闭，让系统自动管理
  }
}

export default new NotificationManager()
