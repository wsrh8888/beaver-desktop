import type { BrowserWindow } from 'electron'
import path from 'node:path'
import { __dirname } from 'mainModule/config'
import { store } from 'mainModule/store'

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
      // }, 1000)
    }
  }

  // 初始化事件监听器
  protected initEvents() {

  }

  getPreloadParams() {
    return {
      env: process.custom.ENV,
      token: store.get('userInfo')?.token,
      devicedId: process.custom.DEVICE_ID,
      version: process.custom.VERSION,
    }
  }
}
