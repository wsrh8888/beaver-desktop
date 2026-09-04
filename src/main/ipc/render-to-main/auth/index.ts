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

import { AuthCommand, SettingsCommand } from 'commonModule/type/ipc/command'
import { BrowserWindow } from 'electron'
import AppApplication from 'mainModule/application/app'
import LoginApplication from 'mainModule/application/login'
import cacheManager from 'mainModule/cache'
import dbManager from 'mainModule/database/db'
import { store } from 'mainModule/store'
import Log from 'mainModule/utils/log'
import Logger from 'mainModule/utils/logger'
import wsManager from 'mainModule/ws-manager'
import settings from 'mainModule/ipc/render-to-main/settings'

const logger = new Logger('AuthHandler')

class AuthHandler {
  /**
   * 统一的认证处理入口
   */
  async handle(_event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: AuthCommand, _data: any) {
    switch (command) {
      case AuthCommand.LOGIN:
        await this.handleLogin()
        break
      case AuthCommand.LOGOUT:
        await this.handleLogout()
        break
      default:
        logger.warn({ text: '收到未知的认证命令', data: { command } })
    }
  }

  /**
   * 处理登录
   */
  async handleLogin() {
    try {
      logger.info({ text: '开始登录流程' })

      // 初始化文件缓存
      cacheManager.init()
      // 1. 关闭登录窗口

      const userInfo = store.get('userInfo')
      logger.info({
        text: '获取本地存储的用户信息',
        data: { hasUserInfo: !!userInfo, userId: userInfo?.userId },
      })
      // 3. 初始化用户缓存
      if (userInfo?.userId) {
        await cacheManager.init(userInfo.userId)

        // 初始化用户日志
        Log.init(userInfo.userId)

        logger.info({
          text: '开始初始化数据库',
        })
        await dbManager.init(userInfo?.userId)

        // 初始化设置模块
        await settings.handle(void 0 as any, SettingsCommand.SETTINGS_INIT, {})

        logger.info({ text: '用户缓存初始化完成' })
      }
      else {
        logger.warn({ text: '本地未存储用户ID，跳过用户缓存与数据库初始化' })
      }

      // 4. 打开app主窗口
      AppApplication.createBrowserWindow()
      this.closeLoginWindow()

      // 5. 在后台建立ws连接 (不阻塞UI显示)
      wsManager.connect()

      logger.info({ text: '开始后台数据同步' })

      logger.info({ text: '登录流程完成，窗口已显示' })
    }
    catch (error) {
      logger.error({ text: '登录流程失败', data: { message: (error as Error)?.message, stack: (error as Error)?.stack } })
      throw error
    }
  }

  /**
   * 处理登出
   */
  async handleLogout() {
    try {
      logger.info({ text: '开始登出流程' })

      store.clearAll()
      logger.info({ text: 'Store数据已清空' })

      // 2. 切换回公共日志
      Log.init()

      // 3. 打开login窗口
      LoginApplication.createBrowserWindow()
      // 2. 关闭所有窗口
      this.closeAllWindows()

      // 4. 关闭ws连接
      wsManager.disconnect()
      logger.info({ text: 'WebSocket连接已关闭' })

      // 5. 关闭数据库连接
      dbManager.close()
      logger.info({ text: '数据库连接已关闭' })

      logger.info({ text: '登出流程完成' })
    }
    catch (error) {
      logger.error({ text: '登出流程失败', data: { message: (error as Error)?.message, stack: (error as Error)?.stack } })
      throw error
    }
  }

  /**
   * 关闭所有应用窗口（排除登录窗口）
   */
  private closeAllWindows() {
    const windows = BrowserWindow.getAllWindows()
    let closedCount = 0
    windows.forEach((window) => {
      if (!window.isDestroyed() && (window as any).__appName !== 'login') {
        window.close()
        closedCount++
      }
    })
    logger.info({ text: '已关闭应用窗口', data: { closedCount, total: windows.length } })
  }

  /**
   * 关闭登录窗口
   */
  private closeLoginWindow() {
    const windows = BrowserWindow.getAllWindows()
    let closedCount = 0
    windows.forEach((window) => {
      if (!window.isDestroyed() && (window as any).__appName === 'login') {
        window.close()
        closedCount++
      }
    })
    logger.info({ text: '已关闭登录窗口', data: { closedCount, total: windows.length } })
  }
}

export default new AuthHandler()
