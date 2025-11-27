import type { IAppModule } from './app'
import type { IAuthModule } from './auth'
import type { ICacheModule } from './cache'
import type { IDatabaseModule } from './database'
import type { IDatasyncModule } from './datasync'
import type { ILoggerModule } from './logger'
import type { INotificationModule } from './notification'
import type { IStorageModule } from './storage'
import type { IUpdateModule } from './update'
import type { IWebSocketModule } from './websocket'
import type { IWindowModule } from './window'

/**
 * @description: Electron preload接口
 */
export interface ElectronAPP {
  /**
   * @description: 日志模块
   */
  logger: ILoggerModule

  /**
   * @description: 窗口管理模块
   */
  window: IWindowModule

  /**
   * @description: 应用信息模块
   */
  app: IAppModule

  /**
   * @description: 数据存储模块
   */
  storage: IStorageModule

  /**
   * @description: 升级模块
   */
  update: IUpdateModule

  /**
   * @description: 缓存模块
   */
  cache: ICacheModule

  /**
   * @description: WebSocket模块
   */
  websocket: IWebSocketModule

  /**
   * @description: 数据库模块（按业务分类）
   */
  database: IDatabaseModule

  /**
   * @description: 通知模块
   */
  notification: INotificationModule

  /**
   * @description: 数据同步模块
   */
  datasync: IDatasyncModule

  /**
   * @description: 认证模块
   */
  auth: IAuthModule
}
