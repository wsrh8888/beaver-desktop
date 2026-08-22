import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import workbenchWebContentsView from 'mainModule/web-contents-view/workbench/workbench'
import ApplicationBase from './common/base'

class Workbench extends ApplicationBase implements Application {
  constructor() {
    super('workbench')
  }

  public createBrowserWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: 1024,
      minWidth: 900,
      height: 726,
      minHeight: 600,
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

  protected initEvents() {
    this.win.on('close', () => {
      workbenchWebContentsView.detachWindow(this.win)
    })
    this.win.on('hide', () => {
      workbenchWebContentsView.hideAll(this.win)
    })
  }
}

export default new Workbench()
