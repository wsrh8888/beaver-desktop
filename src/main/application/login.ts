import { BrowserWindow, screen } from 'electron';
import path from 'node:path';
import { __dirname } from 'mainModule/utils/config';
import { Application } from 'commonModule/type/app/application';
import ApplicationBase from './common/base';
import logger from 'mainModule/utils/log';

class Login extends ApplicationBase implements Application {
  constructor() {
    super('login');
  }

  public createBrowserWindow(): void {
    const primaryDisplay = screen.getPrimaryDisplay();

    // 获取缩放因子
    const scaleFactor = primaryDisplay.scaleFactor;

    const idealWidth = 1364;
    const idealHeight = 1036;
    
    // 按比例缩放理想尺寸，使其适应不同DPI显示设备
    const scaledWidth = idealWidth / scaleFactor;
    const scaledHeight = idealHeight / scaleFactor;
    this.win = new BrowserWindow({
      width: scaledWidth,
      height: scaledHeight,
      frame: false,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, './preload/electron.js'), // 引用预加载脚本
        nodeIntegration: false, // 禁用 Node.js
        nodeIntegrationInWorker: false, // 禁用 Worker 中的 Node.js
        contextIsolation: true, // 启用上下文隔离
        webSecurity: false, // false禁用同源策略
        devTools: true, // 是否开启 DevTools
      },
    });
    this.win.setFullScreenable(false);

    // 加载渲染器
    this.loadRender();
    this.init();
    this.initEvents();
  }
}

export default new Login();
