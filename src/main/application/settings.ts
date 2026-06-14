import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import ApplicationBase from './common/base'

class Settings extends ApplicationBase implements Application {
  constructor() {
    super('settings')
  }

  public createBrowserWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 720,
      minHeight: 520,
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

export default new Settings()
