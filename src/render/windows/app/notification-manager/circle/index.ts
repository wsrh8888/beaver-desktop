import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationCircleCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
import circleNotificationManager from './circle'

const logger = new Logger('圈子模块通知路由器')

/**
 * @description: 圈子模块通知路由器
 */
class CircleNotificationRouter {
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_CIRCLE>) {
    logger.info({
      text: '收到圈子模块通知',
      data: params,
    })

    switch (params.command) {
      case NotificationCircleCommand.CIRCLE_UPDATE:
        await circleNotificationManager.processCircleUpdate(params.data)
        break
      default:
        console.warn('未知的圈子通知命令:', params.command)
    }
  }
}

export const circleNotificationRouter = new CircleNotificationRouter()
