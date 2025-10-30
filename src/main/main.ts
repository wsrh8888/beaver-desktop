import path from 'node:path'
import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import { __dirname } from 'mainModule/config'
import ipcBase from 'mainModule/ipc'

import logger from 'mainModule/utils/log'
import { generateUserAgentIdentifier } from 'mainModule/utils/ua'
import cacheManager from './cache'
import { initCustom, loadConfigs, setupMiniAppDirectory } from './config'
import ipcManager from './ipc'
import { AuthHandler } from './ipc/render-to-main/auth'
import messageManager from './message-manager'
import { store } from './store'

// 屏蔽安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

class Main {
  private tray: Tray | null = null
  private isQuiting: boolean = false

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
    // app.disableHardwareAcceleration();
    // app.commandLine.appendSwitch('gpu-memory-buffer-compositor-resources');
    await app.whenReady()

    if (store.get('userInfo')?.token) {
      // 初始化登录状态
      AuthHandler.handleLogin()
    }
    else {
      AuthHandler.handleLogout()
    }
    ipcBase.init()
    this.createTray()
  }

  setupEventListeners() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // 当所有窗口都隐藏时，不退出应用
    app.on('before-quit', (event) => {
      // 如果有托盘，且不是主动退出，阻止默认的退出行为
      if (this.tray && !this.isQuiting) {
        event.preventDefault()
        // 隐藏所有窗口而不是退出
        const windows = BrowserWindow.getAllWindows()
        windows.forEach((window) => {
          if (!window.isDestroyed()) {
            window.hide()
          }
        })
      }
    })
  }

  initUa() {
    const customIdentifier = generateUserAgentIdentifier()
    app.userAgentFallback = `${app.userAgentFallback || ''} ${customIdentifier}`.trim()
  }

  beforeAppReady() {
    setupMiniAppDirectory()
    messageManager.init()
    ipcManager.init()

    logger.info({ text: 'beforeReady' })
  }

  private createTray() {
    try {
      // 创建托盘图标
      const iconPath = path.join(__dirname, '../resource/logo.png')
      const icon = nativeImage.createFromPath(iconPath) || nativeImage.createEmpty()

      this.tray = new Tray(icon)
      this.tray.setToolTip('Beaver Desktop')

      // 创建托盘菜单
      const contextMenu = Menu.buildFromTemplate([
        {
          label: '显示窗口',
          click: () => {
            const windows = BrowserWindow.getAllWindows()
            windows.forEach((window) => {
              if (!window.isDestroyed()) {
                window.show()
              }
            })
          },
        },
        {
          label: '退出',
          click: () => {
            this.isQuiting = true
            app.quit()
          },
        },
      ])

      this.tray.setContextMenu(contextMenu)

      // 点击托盘图标显示窗口
      this.tray.on('click', () => {
        const windows = BrowserWindow.getAllWindows()
        windows.forEach((window) => {
          if (!window.isDestroyed()) {
            window.show()
          }
        })
      })

      logger.info({ text: '系统托盘创建成功' })
    }
    catch (error) {
      logger.error({ text: '创建系统托盘失败', data: error })
    }
  }

  static init() {
    return new Main()
  }
}

Main.init() // 这里是入口
