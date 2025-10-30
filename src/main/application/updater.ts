import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import ApplicationBase from './common/base'

class Updater extends ApplicationBase implements Application {
  constructor() {
    super('updater') // 对应 updater.html
  }

  public createBrowserWindow(): void {
    this.win = new BrowserWindow({
      width: 450,
      height: 350,
      frame: true, // 有标题栏，可以拖动
      resizable: false,
      skipTaskbar: true, // 不在任务栏显示
      alwaysOnTop: true, // 置顶显示
      webPreferences: {
        preload: path.join(__dirname, './preload/electron.js'), // 复用你的预加载脚本
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
  }
}

export default new Updater()
