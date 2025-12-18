import {
  AuthCommand,
  CacheCommand,
  ConfigCommand,
  DatabaseCommand,
  DataSyncCommand,
  LoggerCommand,
  NetworkCommand,
  NotificationCommand,
  StorageCommand,
  UpdateCommand,
  WebSocketCommand,
  WinHook,
} from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcMainManager from 'mainModule/utils/ipc/ipc-main-manager'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('render-to-main')

// 各业务 Handler
import authHandler from './auth'
import cacheHandler from './cache'
import configHandler from './config'
import databaseHandler from './database'
import dataSyncHandler from './datasync'
import loggerHandler from './logger'
import networkHandler from './network'
import notificationHandler from './notification'
import storageHandler from './storage'
import updaterHandler from './updater'
import webSocketHandler from './websocket'
import windowHandler from './window'

const loggerName = 'render-to-main-msg'

const commandGroups = [
  { enum: WinHook, handler: windowHandler },
  { enum: StorageCommand, handler: storageHandler },
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
          { text: '收到渲染进程到主进程的异步消息', data: { command, data } },
          loggerName,
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
