import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationModule, NotificationCallCommand } from 'commonModule/type/preload/notification'
import Logger from 'renderModule/utils/logger'
import callNotificationManager from './call'

const logger = new Logger('通话模块通知路由器')

/**
 * @description: 通话模块通知路由器
 */
class CallNotificationRouter {
  /**
   * 处理通话模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.CALL>) {
    logger.info({
      text: '收到通话模块通知',
      data: params,
    })

    switch (params.command) {
      case NotificationCallCommand.CALL_INVITE:
        await callNotificationManager.processCallInvite(params.data)
        break
      case NotificationCallCommand.CALL_ENDED:
        callNotificationManager.processCallEnded(params.data)
        break
      default:
        console.warn('未知的通话通知命令:', params.command)
    }
  }
}

export const callNotificationRouter = new CallNotificationRouter()
