import path from 'node:path'
import { app, session } from 'electron'

// 支持分配不同的本地缓存目录，用于多开测试
if (process.env.APP_PROFILE) {
  const userDataPath = path.join(app.getPath('appData'), app.getName(), `profile-${process.env.APP_PROFILE}`)
  app.setPath('userData', userDataPath)
  console.log('检测到 APP_PROFILE，设置用户目录为:', userDataPath)
}

// 如果设置了 USE_FAKE_MEDIA，则使用模拟摄像头和麦克风，避免硬件被独占报错
if (process.env.USE_FAKE_MEDIA === 'true') {
  app.commandLine.appendSwitch('use-fake-ui-for-media-stream')
  app.commandLine.appendSwitch('use-fake-device-for-media-stream')
  console.log('检测到 USE_FAKE_MEDIA，已启用模拟媒体设备')
}

// 注册自定义协议（用于 OAuth 回调）
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('beaver', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('beaver')
}

import logger from 'mainModule/utils/log'
import { generateUserAgentIdentifier } from 'mainModule/utils/ua'
import trayHandler from './application/tray'
import cacheManager from './cache'
import { initCustom, loadConfigs } from './config'
import ipcManager from './ipc'
import authHandler from './ipc/render-to-main/auth'
import messageManager from './message-manager'
import { store } from './store'
import { mcpManager } from './mcp-manager/index.js'

// 屏蔽安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

class Main {
  constructor() {
    // 单例检查 - 如果已经有实例运行，直接返回
    if (!this.checkSingleInstance()) {
      return
    }

    // 只有当前实例是唯一的才继续初始化
    initCustom()
    this.initUa()

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

    // 默认允许媒体权限（摄像头、麦克风），避免环境差异导致的权限弹窗或拦截
    session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
      if (permission === 'media') {
        return callback(true)
      }
      callback(false)
    })

    if (store.get('userInfo')?.token) {
      // 初始化登录状态
      authHandler.handleLogin()
    }
    else {
      authHandler.handleLogout()
    }
    // IPC已在beforeAppReady中初始化，这里不需要重复初始化
    // ipcBase.init()

    mcpManager.init()
  }

  setupEventListeners() {
    // 处理 Windows/Linux 的第二个实例（通过 Scheme 启动）
    app.on('second-instance', (_event, commandLine) => {
      // 查找 beaver:// 协议的 URL
      const url = commandLine.find(arg => arg.startsWith('beaver://'))
      if (url) {
        this.handleOAuthCallback(url)
      }
    })

    // 处理 macOS 的 open-url 事件
    app.on('open-url', (_event, url) => {
      if (url.startsWith('beaver://')) {
        this.handleOAuthCallback(url)
      }
    })

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

  checkSingleInstance() {
    // 如果设置了 APP_PROFILE，认为是测试多开模式，跳过单例检查
    if (process.env.APP_PROFILE) {
      return true
    }

    // 检查是否已经有实例在运行
    const gotTheLock = app.requestSingleInstanceLock()

    if (!gotTheLock) {
      // 如果已经有实例在运行，直接退出
      app.quit()
      return false
    }

    return true
  }

  initUa() {
    const customIdentifier = generateUserAgentIdentifier()
    app.userAgentFallback = `${app.userAgentFallback || ''} ${customIdentifier}`.trim()
  }

  // 处理 OAuth 回调
  handleOAuthCallback(url: string) {
    logger.info({ text: `收到 OAuth 回调: ${url}` })
    
    // 解析 URL，提取 code 参数
    try {
      const urlObj = new URL(url)
      const code = urlObj.searchParams.get('code')
      
      if (code) {
        logger.info({ text: `OAuth 授权码: ${code}` })
        // TODO: 将 code 发送给渲染进程处理
        // 可以通过 IPC 发送到登录窗口或主窗口
      }
    } catch (error) {
      logger.error({ text: `解析 OAuth 回调失败: ${error}` })
    }
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
