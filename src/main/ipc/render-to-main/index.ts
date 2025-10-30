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
import logger from 'mainModule/utils/log'

// 各业务 Handler
import { AuthHandler } from './auth'
import { CacheHandler } from './cache'
import { ConfigHandler } from './config'
import { DatabaseHandler } from './database'
import { DataSyncHandler } from './datasync'
import { LoggerHandler } from './logger'
import { NetworkHandler } from './network'
import { NotificationHandler } from './notification'
import { StorageHandler } from './storage'
import { UpdaterHandler } from './updater'
import { WebSocketHandler } from './websocket'
import { WindowHandler } from './window'

const loggerName = 'render-to-main-msg'

const commandGroups = [
  { enum: WinHook, handler: WindowHandler },
  { enum: StorageCommand, handler: StorageHandler },
  { enum: ConfigCommand, handler: ConfigHandler },
  { enum: UpdateCommand, handler: UpdaterHandler },
  { enum: NotificationCommand, handler: NotificationHandler },
  { enum: AuthCommand, handler: AuthHandler },
  { enum: CacheCommand, handler: CacheHandler },
  { enum: DatabaseCommand, handler: DatabaseHandler },
  { enum: DataSyncCommand, handler: DataSyncHandler },
  { enum: NetworkCommand, handler: NetworkHandler },
  { enum: WebSocketCommand, handler: WebSocketHandler },
  { enum: LoggerCommand, handler: LoggerHandler },
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
            loggerName,
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
        logger.error({ text: '未知命令', data: { command, data } }, loggerName)
        return
      }
      return group.handler.handle(event, command, data)
    }
    catch (err) {
      logger.error(
        { text: 'Handler 执行异常', data: { command, error: err } },
        loggerName,
      )
    }
  }
}

export default new IpcManager()
