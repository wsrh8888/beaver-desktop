import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationFriendCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入好友模块的通知处理器
import friendNotificationManager from './friend'
import friendVerifyNotificationManager from './friend-verify'

const logger = new Logger('好友模块通知路由器')

/**
 * @description: 好友模块通知路由器
 */
class FriendNotificationRouter {
  /**
   * 处理好友模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_FRIEND>) {
    logger.info({
      text: '收到好友模块通知',
      data: params,
    })

    switch (params.command) {
      case NotificationFriendCommand.FRIEND_UPDATE:
        await friendNotificationManager.processFriendUpdate(params.data)
        break
      case NotificationFriendCommand.FRIEND_VALID_UPDATE:
        await friendVerifyNotificationManager.processFriendVerifyUpdate(params.data)
        break
      default:
        console.warn('未知的好友通知命令:', params.command)
    }
  }
}

export const friendNotificationRouter = new FriendNotificationRouter()
