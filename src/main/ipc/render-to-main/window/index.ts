import type { IWindowOpenOptions, IWinodwCloseOptions } from 'commonModule/type/preload/window'
import { WinHook } from 'commonModule/type/ipc/command'
import { NotificationModule } from 'commonModule/type/preload/notification'
import { BrowserWindow } from 'electron'
import appApplication from 'mainModule/application/app'
import aiApplication from 'mainModule/application/ai'
import audioApplication from 'mainModule/application/audio'
import imageApplication from 'mainModule/application/image'
import loginApplication from 'mainModule/application/login'
import momentApplication from 'mainModule/application/moment'
import searchApplication from 'mainModule/application/search'
import updateApplication from 'mainModule/application/updater'
import verifyApplication from 'mainModule/application/verify'
import videoApplication from 'mainModule/application/video'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'

class WindowHandler {
  /**
   * 统一的窗口处理入口（支持同步和异步）
   */
  handle(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: WinHook | string, data: any): any {
    logger.info({ text: '收到render-to-main-msg窗口消息', data: {
      command,
      data,
    } }, 'WindowHandler')

    const name = data?.name || ''
    const options = data?.options || {}
    // 处理同步命令
    switch (command) {
      case WinHook.CLOSE:
        this.handleClose(event, name, options)
        break
      case WinHook.MINIMIZE:
        this.handleMinimize(event, name, options)
        break
      case WinHook.MAXIMIZE:
        this.handleToggleMaximize(event, name, options)
        break
      case WinHook.OPEN_WINDOW:
        return this.handleOpen(event, name, options)
      default:
        console.error(`窗口处理未知命令: ${command}`)
    }
  }

  /**
   * 关闭窗口
   */
  private handleClose(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, name: string, options: IWinodwCloseOptions) {
    const { hideOnly = false } = options
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      if (hideOnly) {
        window.hide()
      }
      else {
        console.log('关闭窗口', window)
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
  private handleMinimize(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, _name: string, _options: IWindowOpenOptions) {
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
  private handleToggleMaximize(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, _name: string, _options: IWindowOpenOptions) {
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
  private async handleOpen(_event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, name: string, options: IWindowOpenOptions): Promise<void> {
    const unique = options.unique || true // 默认唯一
    const params = options.params || {}
    // 通过name搜素进程
    const window = BrowserWindow.getAllWindows().find(win => (win as any).__appName === name)
    if (window && unique) {
      window.show()
      window.focus()

      // 如果窗口已存在且有参数，通过notification发送更新命令
      if (Object.keys(params).length > 0) {
        this.updateWindowContent(name, params)
      }

      return Promise.resolve()
    }
    else {
      console.log('打开新窗口', name, window, options)
      let newWindow!: BrowserWindow

      switch (name) {
        case 'app':
          newWindow = appApplication.createBrowserWindow()
          break
        case 'login':
          newWindow = loginApplication.createBrowserWindow()
          break
        case 'search':
          searchApplication.createBrowserWindow()
          newWindow = (searchApplication as any).win
          break
        case 'verify':
          verifyApplication.createBrowserWindow()
          newWindow = (verifyApplication as any).win
          break
        case 'image':
          imageApplication.createBrowserWindow()
          newWindow = (imageApplication as any).win
          break
        case 'video':
          videoApplication.createBrowserWindow()
          newWindow = (videoApplication as any).win
          break
        case 'audio':
          audioApplication.createBrowserWindow()
          newWindow = (audioApplication as any).win
          break
        case 'moment':
          momentApplication.createBrowserWindow()
          newWindow = (momentApplication as any).win
          break
        case 'updater':
          updateApplication.createBrowserWindow()
          newWindow = (updateApplication as any).win
          break
        case 'ai':
          aiApplication.createBrowserWindow()
          newWindow = (aiApplication as any).win
          break
      }

      // 如果创建了新窗口，等待它准备好，然后发送参数
      if (newWindow) {
        return new Promise((resolve) => {
          newWindow!.once('ready-to-show', () => {
            // 窗口准备好后，如果有参数，通过notification发送更新命令
            if (Object.keys(params).length > 0) {
              // 延迟一小段时间确保窗口完全加载
              setTimeout(() => {
                this.updateWindowContent(name, params)
                resolve()
              }, 100)
            }
            else {
              resolve()
            }
          })
        })
      }

      return Promise.resolve()
    }
  }

  /**
   * 更新窗口内容（通过notification）
   */
  private updateWindowContent(name: string, params: Record<string, any>): void {
    switch (name) {
      case 'image':
        sendMainNotification(name, NotificationModule.MEDIA_VIEWER, 'updateImage', params)
        break
      case 'video':
        sendMainNotification(name, NotificationModule.MEDIA_VIEWER, 'updateVideo', params)
        break
      case 'audio':
        sendMainNotification(name, NotificationModule.MEDIA_VIEWER, 'updateAudio', params)
        break
      case 'updater':
        console.log('更新窗口内容', name, params)
        console.log('更新窗口内容', name, params)
        console.log('更新窗口内容', name, params)
        sendMainNotification(name, NotificationModule.MEDIA_VIEWER, 'updateInfo', params)
        break
    }
  }
}

export default new WindowHandler()
