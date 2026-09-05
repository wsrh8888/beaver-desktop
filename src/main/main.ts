/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import path from 'node:path'
import { app, globalShortcut } from 'electron'

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

import Logger from 'mainModule/utils/logger'

const logger = new Logger('Main')

// 全局未捕获异常处理，确保主进程任何意外异常都能落盘便于排查
process.on('uncaughtException', (error: Error) => {
  logger.error({
    text: '主进程未捕获异常',
    data: { message: error?.message, stack: error?.stack },
  })
})

// 全局未处理的 Promise 拒绝，避免异步异常被静默吞掉
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({
    text: '主进程未处理的 Promise 拒绝',
    data: { reason: reason instanceof Error ? reason.message : String(reason) },
  })
})
import { generateUserAgentIdentifier } from 'mainModule/utils/ua'
import trayHandler from './application/tray'
import cacheManager from './cache'
import { initCustom, loadConfigs } from './config'
import ipcManager from './ipc'
import authHandler from './ipc/render-to-main/auth'
import messageManager from './message-manager'
import { store } from './store'
import { mcpManager } from './mcp-manager/index.js'
import localServer from './server'
// 屏蔽安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

class Main {
  constructor() {
    // 单例检查 - 如果已经有实例运行，直接返回
    if (!this.checkSingleInstance()) {
      logger.info({ text: '已有实例运行，当前实例退出' })
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
    logger.info({ text: '主进程事件监听器已注册' })
    cacheManager.init()
    logger.info({ text: '缓存模块初始化完成' })
    this.beforeAppReady()
    this.onAppReady()
    logger.info({ text: '初始化完成' })
  }

  async onAppReady() {
    await app.whenReady()
    logger.info({ text: '应用已就绪' })

    // 启动本地 HTTP 服务（用于第三方网页检测登录状态）
    if (store.get('userInfo')?.token) {
      logger.info({ text: '检测到登录态，初始化登录状态' })
      authHandler.handleLogin()
    }
    else {
      logger.info({ text: '未检测到登录态，初始化登出状态' })
      authHandler.handleLogout()
    }
    // IPC已在beforeAppReady中初始化，这里不需要重复初始化
    // ipcBase.init()

    try {
      await localServer.start()
      logger.info({ text: '本地服务启动成功' })
    } catch (error: any) {
      logger.error({ text: '本地服务启动失败', data: { message: error?.message } })
    }

    mcpManager.init()
    logger.info({ text: 'MCP 管理器初始化完成' })
  }

  setupEventListeners() {
    app.on('window-all-closed', () => {
      logger.info({ text: '所有窗口已关闭', data: { platform: process.platform } })
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    app.on('browser-window-created', (_, window) => {
      window.on('closed', () => {
        // 如果关闭的是app窗口，则销毁托盘
        if ((window as any).__appName === 'app') {
          logger.info({ text: 'app 窗口关闭，销毁托盘' })
          trayHandler.destroy()
        }
      })
    })
    app.on('will-quit', () => {
      logger.info({ text: '应用即将退出，注销全局快捷键' })
      globalShortcut.unregisterAll()
    })
  }

  checkSingleInstance() {
    // 如果设置了 APP_PROFILE，认为是测试多开模式，跳过单例检查
    if (process.env.APP_PROFILE) {
      logger.info({ text: '检测到 APP_PROFILE，跳过单例检查（多开测试模式）' })
      return true
    }

    // 检查是否已经有实例在运行
    const gotTheLock = app.requestSingleInstanceLock()

    if (!gotTheLock) {
      // 如果已经有实例在运行，直接退出
      logger.info({ text: '未获取到单例锁，当前实例退出' })
      app.quit()
      return false
    }

    return true
  }

  initUa() {
    const customIdentifier = generateUserAgentIdentifier()
    app.userAgentFallback = `${app.userAgentFallback || ''} ${customIdentifier}`.trim()
    logger.info({ text: '用户代理标识已设置', data: { identifier: customIdentifier } })
  }


  beforeAppReady() {
    messageManager.init()
    logger.info({ text: '消息管理器初始化完成' })
    ipcManager.init()
    logger.info({ text: 'IPC 管理器初始化完成' })
  }

  static init() {
    return new Main()
  }
}

Main.init() // 这里是入口
