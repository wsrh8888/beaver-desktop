import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationUserCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入用户模块的通知处理器
import userNotificationManager from './user'

const logger = new Logger('用户模块通知路由器')

/**
 * @description: 用户模块通知路由器
 */
class UserNotificationRouter {
  /**
   * 处理用户模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_USER>) {
    logger.info({
      text: '收到用户模块通知',
      data: params,
    })
    switch (params.command) {
      case NotificationUserCommand.USER_UPDATE:
        await userNotificationManager.processUserUpdate(params.data)
        break
      default:
        console.warn('未知的用户通知命令:', params.command)
    }
  }
}

export const userNotificationRouter = new UserNotificationRouter()
