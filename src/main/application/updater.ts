import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import ApplicationBase from './common/base'

class Updater extends ApplicationBase implements Application {
  constructor() {
    super('updater') // 对应 updater.html
  }

  public createBrowserWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: 480,
      height: 450,
      frame: false, // 无边框设计
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, './preload/index.mjs'), // 复用你的预加载脚本
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        devTools: process.custom.TOOLS, // 复用你的开发工具配置
        additionalArguments: [`--custom=${JSON.stringify({ ...this.getPreloadParams() })}`],
      },
    })

    // 复用你的基础方法
    this.loadRender()
    this.init()
    this.initEvents()
    return this.win
  }
}

export default new Updater()
