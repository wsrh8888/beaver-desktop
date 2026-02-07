import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import ApplicationBase from './common/base'

class CallApplication extends ApplicationBase implements Application {
  constructor() {
    super('call')
  }

  public createBrowserWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: 850,
      height: 600,
      minWidth: 360,
      minHeight: 480,
      frame: false,
      resizable: true,
      title: 'Beaver Call',
      webPreferences: {
        preload: path.join(__dirname, './preload/index.mjs'),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        devTools: true,
        additionalArguments: [`--custom=${JSON.stringify({ ...this.getPreloadParams() })}`],
      },
    })

    this.win.center()
    this.win.setAlwaysOnTop(true, 'screen-saver')

    // 加载渲染器
    this.loadRender()
    this.init()
    this.initEvents()
    return this.win
  }
}

export default new CallApplication()
