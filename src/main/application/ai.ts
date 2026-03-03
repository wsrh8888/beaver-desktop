import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import ApplicationBase from './common/base'

class Ai extends ApplicationBase implements Application {
  constructor() {
    super('ai')
  }

  public createBrowserWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: 1000,
      height: 700,
      frame: false,
      resizable: true,
      minimizable: true,
      maximizable: true,
      webPreferences: {
        preload: path.join(__dirname, './preload/index.mjs'), // 引用预加载脚本
        nodeIntegration: false, // 禁用 Node.js
        nodeIntegrationInWorker: false, // 禁用 Worker 中的 Node.js
        contextIsolation: true, // 启用上下文隔离
        webSecurity: false, // false禁用同源策略
        devTools: true, // 是否开启 DevTools
        additionalArguments: [`--custom=${JSON.stringify({ ...this.getPreloadParams() })}`],

      },
    })

    // 加载渲染器
    this.loadRender()
    this.init()
    this.initEvents()
    return this.win
  }
}

export default new Ai()
