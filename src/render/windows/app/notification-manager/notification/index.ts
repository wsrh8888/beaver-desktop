import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationNotificationCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入通知模块的通知处理器
import inboxNotificationManager from './inbox'

const logger = new Logger('通知模块通知路由器')
/**
 * @description: 通知模块通知路由器
 */
class NotificationNotificationRouter {
  /**
   * 处理通知模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_NOTIFICATION>) {
    logger.info({
      text: '收到通知模块通知',
      data: params,
    })
    switch (params.command) {
      case NotificationNotificationCommand.INBOX_UPDATE:
        await inboxNotificationManager.processInboxUpdate(params.data)
        break
      default:
        console.warn('未知的通知通知命令:', params.command)
    }
  }
}

export const notificationNotificationRouter = new NotificationNotificationRouter()
