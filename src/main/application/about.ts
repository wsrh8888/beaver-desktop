import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import ApplicationBase from './common/base'

class About extends ApplicationBase implements Application {
  constructor() {
    super('about')
  }

  public createBrowserWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: 560,
      height: 720,
      minWidth: 480,
      minHeight: 560,
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
    this.loadRender()
    this.init()
    this.initEvents()
    return this.win
  }
}

export default new About()
