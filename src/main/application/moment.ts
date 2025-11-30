import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import ApplicationBase from './common/base'

class Moment extends ApplicationBase implements Application {
  constructor() {
    super('moment')
  }

  public createBrowserWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: 670,
      minHeight: 726,
      minWidth: 670,
      maxWidth: 670,
      frame: false,
      resizable: true,
      webPreferences: {
        preload: path.join(__dirname, './preload/index.mjs'),
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: true,
        webSecurity: false,
        devTools: true,
        additionalArguments: [`--custom=${JSON.stringify({ ...this.getPreloadParams() })}`],
      },
    })
    this.win.setFullScreenable(false)

    // 加载渲染器
    this.loadRender()
    this.init()
    this.initEvents()
    return this.win
  }
}

export default new Moment()
