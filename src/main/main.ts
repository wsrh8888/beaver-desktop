import { app } from "electron";
import logger from 'mainModule/utils/log';
import ipcBase from 'mainModule/ipc';
import LoginApplication from "mainModule/application/login";
import AppApplication from "mainModule/application/app";

import { initCustom, loadConfigs } from "./config";
import { getStore } from "mainModule/utils/store/store";

// 屏蔽安全警告
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

class Main {
  constructor() {
    this.initMainProcess();
  }

  initMainProcess() {
    logger.info('开始初始化');
    this.setupEventListeners();
    this.beforeAppReady();
    this.onAppReady();
  }

  async onAppReady() {
    // app.disableHardwareAcceleration();
    // app.commandLine.appendSwitch('gpu-memory-buffer-compositor-resources');
    await app.whenReady();
    if (getStore("loginInfo")?.token) {
      AppApplication.createBrowserWindow();
    } else {
      LoginApplication.createBrowserWindow();
    }
    ipcBase.init();
  }

  setupEventListeners() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  beforeAppReady() {
    initCustom();
    loadConfigs();
    logger.info('beforeReady');
  }

  static init() {
    return new Main();
  }
}

Main.init(); // 这里是入口
