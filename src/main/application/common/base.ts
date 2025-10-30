import type { BrowserWindow } from 'electron'
import path from 'node:path'
import { app, dialog } from 'electron'
import { __dirname } from 'mainModule/config'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

export default class ApplicationBase {
  protected win!: BrowserWindow
  protected name: string

  constructor(name: string) {
    this.name = name
  }

  protected loadRender() {
    const url = process.env.VITE_DEV_SERVER_URL
      ? `${process.env.VITE_DEV_SERVER_URL}/${this.name}.html`
      : path.join(__dirname, `../dist/${this.name}.html`)

    this.win.loadURL(url)
  }

  protected loadUrlRender(url: string) {
    this.win.loadURL(url)
  }

  protected init() {
    (this.win as any).__appName = this.name
    if (process.custom.TOOLS) {
      // 延迟打开开发者工具，确保窗口完全加载
      // setTimeout(() => {
      //   this.win.webContents.openDevTools()
      //   logger.info({ text: '开发者工具已打开' })
      // }, 1000)
    }
  }

  // 初始化事件监听器
  protected initEvents() {
    this.win.webContents.on('render-process-gone', this.handleRenderProcessGone.bind(this))
    this.win.webContents.on('did-finish-load', this.handleFinishLoad.bind(this))
    this.win.webContents.on('did-fail-load', this.handleDidFailLoad.bind(this))
  }

  private handleFinishLoad() {
    logger.info({ text: 'Page loaded successfully' })
  }

  private handleRenderProcessGone(_event: Electron.Event, details: Electron.RenderProcessGoneDetails) {
    switch (details.reason) {
      case 'crashed':
        this.handleCrash()
        break
      case 'killed':
        this.handleKilled()
        break
      case 'oom':
        this.handleOOM()
        break
      default:
        this.handleUnknown(details.reason)
        break
    }
  }

  private handleDidFailLoad(_event: Electron.Event, _errorCode: number, errorDescription: string, validatedURL: string) {
    logger.error({ text: `Page failed to load: ${validatedURL}`, data: errorDescription })
    this.showLoadErrorDialog()
  }

  // 渲染进程崩溃处理
  private handleCrash() {
    dialog.showMessageBox({
      type: 'error',
      title: '渲染进程崩溃',
      message: '渲染进程已崩溃，请重新启动应用程序。',
      buttons: ['重启', '关闭'],
    }).then((result) => {
      if (result.response === 0) {
        app.relaunch()
        app.exit(0)
      }
      else {
        app.quit()
      }
    })
  }

  // 渲染进程被杀死处理
  private handleKilled() {
    logger.warn({ text: '渲染进程被杀死，可以选择记录日志或通知用户。' })
  }

  // 内存不足处理
  private handleOOM() {
    logger.error({ text: '渲染进程内存不足，尝试释放内存或采取其它恢复措施。' })
  }

  // 未知原因导致渲染进程消失处理
  private handleUnknown(reason: string) {
    logger.warn({ text: `渲染进程因未知原因消失：${reason}` })
  }

  // 页面加载失败处理
  private showLoadErrorDialog() {
    dialog.showMessageBox({
      type: 'error',
      title: '页面加载失败',
      message: '页面加载失败，请检查网络连接或联系支持人员。',
      buttons: ['重试', '关闭'],
    }).then((result) => {
      if (result.response === 0) {
        this.win.reload()
      }
      else {
        app.quit()
      }
    })
  }

  closeBrowserWindow() {
    this.win.close()
  }

  getPreloadParams() {
    return {
      env: process.custom.ENV,
      token: store.get('userInfo')?.token,
      devicedId: process.custom.DEVICE_ID,
    }
  }
}
