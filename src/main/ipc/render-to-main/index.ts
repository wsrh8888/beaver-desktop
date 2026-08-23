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

import {
  AuthCommand,
  BridgeCommand,
  CacheCommand,
  ClipboardCommand,
  ConfigCommand,
  DatabaseCommand,
  DataSyncCommand,
  LoggerCommand,
  NetworkCommand,
  NotificationCommand,
  KeyboardCommand,
  SettingsCommand,
  StorageCommand,
  UpdateCommand,
  WebSocketCommand,
  WinHook,
  WorkbenchCommand,
} from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcMainManager from 'mainModule/utils/ipc/ipc-main-manager'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('render-to-main')

// 各业务 Handler
import authHandler from './auth'
import bridgeHandler from './bridge'
import cacheHandler from './cache'
import clipboardHandler from './clipboard'
import configHandler from './config'
import databaseHandler from './database'
import dataSyncHandler from './datasync'
import loggerHandler from './logger'
import networkHandler from './network'
import notificationHandler from './notification'
import storageHandler from './storage'
import updaterHandler from './updater'
import webSocketHandler from './websocket'
import settingsHandler from './settings'
import keyboardHandler from './keyboard'
import windowHandler from './window'
import workbenchHandler from './workbench'

const loggerName = 'render-to-main-msg'

const commandGroups = [
  { enum: WinHook, handler: windowHandler },
  { enum: ClipboardCommand, handler: clipboardHandler },
  { enum: StorageCommand, handler: storageHandler },
  { enum: KeyboardCommand, handler: keyboardHandler },
  { enum: SettingsCommand, handler: settingsHandler },
  { enum: ConfigCommand, handler: configHandler },
  { enum: UpdateCommand, handler: updaterHandler },
  { enum: NotificationCommand, handler: notificationHandler },
  { enum: AuthCommand, handler: authHandler },
  { enum: CacheCommand, handler: cacheHandler },
  { enum: DatabaseCommand, handler: databaseHandler },
  { enum: DataSyncCommand, handler: dataSyncHandler },
  { enum: NetworkCommand, handler: networkHandler },
  { enum: WebSocketCommand, handler: webSocketHandler },
  { enum: LoggerCommand, handler: loggerHandler },
  { enum: WorkbenchCommand, handler: workbenchHandler },
  { enum: BridgeCommand, handler: bridgeHandler },
]

class IpcManager {
  /**
   * 初始化渲染进程到主进程的消息处理器（同步和异步）
   */
  init() {
    this.initIpcListeners()
    this.initIpcListenersAsync()
  }

  /**
   * 初始化同步消息监听
   */
  private initIpcListeners() {
    ipcMainManager.on(
      IEvent.RenderToMain,
      (event: Electron.IpcMainEvent, command: string, data: any = {}): void => {
        if (command !== LoggerCommand.LOG) {
          logger.info(
            { text: '收到渲染进程到主进程的同步消息', data: { command, data } },
          )
        }
        this.routeCommand(event, command, data)
      },
    )
  }

  /**
   * 初始化异步消息监听
   */
  private initIpcListenersAsync() {
    ipcMainManager.handle(
      IEvent.RenderToMainSyncMsg,
      async (
        event: Electron.IpcMainInvokeEvent,
        command: string,
        data: any = {},
      ): Promise<unknown> => {
        logger.info(
          { text: '收到渲染进程到主进程的异步消息', data: { command, data } }
        )
        return this.routeCommand(event, command, data)
      },
    )
  }

  /**
   * 命令路由分发（集中配置+查找）
   */
  private routeCommand(
    event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: string,
    data: any,
  ) {
    try {
      const group = commandGroups.find(g =>
        Object.values(g.enum).includes(command),
      )
      if (!group) {
        logger.error({ text: '未知命令', data: { command, data } })
        return
      }
      return group.handler.handle(event, command, data)
    }
    catch (err) {
      logger.error(
        { text: 'Handler 执行异常', data: { command, error: err } },
      )
    }
  }
}

export default new IpcManager()
