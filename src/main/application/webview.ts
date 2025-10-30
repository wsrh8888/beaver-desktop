import type { Application } from 'commonModule/type/app/application'
import { BrowserWindow } from 'electron'
import ApplicationBase from './common/base'

class WebView extends ApplicationBase implements Application {
  declare mainWin: BrowserWindow

  constructor() {
    super('app')
  }

  public createBrowserWindow(url: string): void {
    this.win = new BrowserWindow({
      width: 375,
      height: 450,
      webPreferences: {
        nodeIntegration: false, // 禁用 Node.js
        contextIsolation: true, // 启用上下文隔离
        webSecurity: false,
      },
    })
    this.loadUrlRender(url)
  }
}

export default new WebView()
