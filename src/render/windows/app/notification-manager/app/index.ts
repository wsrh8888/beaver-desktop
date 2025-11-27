import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationAppLifecycleCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入应用生命周期的通知处理器
import appLifecycleNotificationManager from './connection'

const logger = new Logger('应用模块通知路由器')

/**
 * @description: 应用模块通知路由器
 */
class AppNotificationRouter {
  /**
   * 处理应用模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.APP_LIFECYCLE>) {
    logger.info({
      text: '收到应用模块通知',
      data: params,
    })
    switch (params.command) {
      case NotificationAppLifecycleCommand.STATUS_CHANGE:
        await appLifecycleNotificationManager.handleLifecycleStatusChange(params.data)
        break
      default:
        console.warn('未知的应用通知命令:', params.command)
    }
  }
}

export const appNotificationRouter = new AppNotificationRouter()
