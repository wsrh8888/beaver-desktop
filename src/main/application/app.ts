import { BrowserWindow, screen } from 'electron';
import path from 'node:path';
import { Application } from 'commonModule/type/app/application';
import { __dirname } from 'mainModule/utils/config';
import ApplicationBase from './common/base';

class App extends ApplicationBase implements Application {
  declare mainWin: BrowserWindow;

  constructor() {
    super('app');
  }

  public createBrowserWindow(): void {
    this.win = new BrowserWindow({
      width: 1024,
      height: 726,
      minWidth: 1024,
      minHeight: 726,
      frame: false,
      webPreferences: {
        preload: path.join(__dirname, './preload/electron.js'), // 引用预加载脚本
        nodeIntegration: false, // 禁用 Node.js
        nodeIntegrationInWorker: false, // 禁用 Worker 中的 Node.js
        contextIsolation: true, // 启用上下文隔离
        webSecurity: false, // false禁用同源策略
        devTools: true, // 是否开启 DevTools
        additionalArguments: [`--custom=${JSON.stringify({ ...this.getPreloadParams() })}`],
      },
    });
    this.win.setFullScreenable(false);
    // 加载渲染器
    this.loadRender();
    this.init();
    this.initEvents();
  }

}

export default new App();
