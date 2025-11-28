import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import ApplicationBase from './common/base'

class Audio extends ApplicationBase implements Application {
  constructor() {
    super('audio')
  }

  public createBrowserWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: 600,
      height: 400,
      minWidth: 500,
      minHeight: 350,
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

export default new Audio()
