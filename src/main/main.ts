import { app } from 'electron'

import logger from 'mainModule/utils/log'
import { generateUserAgentIdentifier } from 'mainModule/utils/ua'
import trayHandler from './application/tray'
import cacheManager from './cache'
import { initCustom, loadConfigs } from './config'
import ipcManager from './ipc'
import { AuthHandler } from './ipc/render-to-main/auth'
import messageManager from './message-manager'
import { store } from './store'

// 屏蔽安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

class Main {
  constructor() {
    this.initUa()
    initCustom()
    loadConfigs()
    this.initMainProcess()
  }

  initMainProcess() {
    logger.info({ text: '开始初始化' })
    this.setupEventListeners()
    cacheManager.init()
    this.beforeAppReady()
    this.onAppReady()
    logger.info({ text: '初始化完成' })
  }

  async onAppReady() {
    await app.whenReady()

    if (store.get('userInfo')?.token) {
      // 初始化登录状态
      AuthHandler.handleLogin()
    }
    else {
      AuthHandler.handleLogout()
    }
    // IPC已在beforeAppReady中初始化，这里不需要重复初始化
    // ipcBase.init()
  }

  setupEventListeners() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    app.on('browser-window-created', (_, window) => {
      window.on('closed', () => {
        // 如果关闭的是app窗口，则销毁托盘
        if ((window as any).__appName === 'app') {
          trayHandler.destroy()
        }
      })
    })
  }

  initUa() {
    const customIdentifier = generateUserAgentIdentifier()
    app.userAgentFallback = `${app.userAgentFallback || ''} ${customIdentifier}`.trim()
  }

  beforeAppReady() {
    messageManager.init()
    ipcManager.init()

    logger.info({ text: 'beforeReady' })
  }

  static init() {
    return new Main()
  }
}

Main.init() // 这里是入口
