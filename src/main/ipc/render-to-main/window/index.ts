import { WinHook } from 'commonModule/type/ipc/command'
import { BrowserWindow } from 'electron'
import appApplication from 'mainModule/application/app'
import loginApplication from 'mainModule/application/login'
import searchApplication from 'mainModule/application/search'
import verifyApplication from 'mainModule/application/verify'
import logger from 'mainModule/utils/log'

export class WindowHandler {
  /**
   * 统一的窗口处理入口（支持同步和异步）
   */
  static handle(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: WinHook | string, data: any): any {
    logger.info({ text: '收到render-to-main-msg窗口消息', data: {
      command,
      data,
    } }, 'WindowHandler')

    // 处理同步命令
    switch (command) {
      case WinHook.CLOSE:
        this.handleClose(event, data)
        break
      case WinHook.MINIMIZE:
        this.handleMinimize(event)
        break
      case WinHook.MAXIMIZE:
        this.handleToggleMaximize(event)
        break
      case WinHook.OPEN_WINDOW:
        this.handleOpen(data)
        break
      default:
        console.error(`窗口处理未知命令: ${command}`)
    }
  }

  /**
   * 关闭窗口
   */
  private static handleClose(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, data: any) {
    // { hideOnly?: boolean, isSelf?: boolean }
    const { hideOnly = false } = data
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      if (hideOnly) {
        window.hide()
      }
      else {
        window.close()
      }
    }
    else {
      logger.error({ text: `[render][${event.sender.id}] 无法获取窗口实例` })
    }
  }

  /**
   * 最小化窗口
   */
  private static handleMinimize(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent) {
    logger.info({ text: `[render][${event.sender.id}] 最小化窗口` })
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      window.minimize()
    }
    else {
      logger.error({ text: `[render][${event.sender.id}] 无法获取窗口实例` })
    }
  }

  /**
   * 切换窗口最大化状态
   */
  private static handleToggleMaximize(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent) {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      if (window.isMaximized()) {
        logger.info({ text: `[render][${event.sender.id}] 恢复窗口` })
        window.restore()
      }
      else {
        logger.info({ text: `[render][${event.sender.id}] 最大化窗口` })
        window.maximize()
      }
    }
    else {
      logger.error({ text: `[render][${event.sender.id}] 无法获取窗口实例` })
    }
  }

  /**
   * 打开指定窗口
   */
  private static handleOpen(data: { name: string, options?: any }) {
    const options = data.options || {}
    const unique = options.unique || true // 默认唯一
    // 通过name搜素进程
    const window = BrowserWindow.getAllWindows().find(win => (win as any).__appName === data.name)
    if (window && unique) {
      window.show()
      window.focus()
    }
    else {
      switch (data.name) {
        case 'app':
          appApplication.createBrowserWindow()
          break
        case 'login':
          loginApplication.createBrowserWindow()
          break
        case 'search':
          searchApplication.createBrowserWindow()
          break
        case 'verify':
          verifyApplication.createBrowserWindow()
          break
      }
    }
  }
}
