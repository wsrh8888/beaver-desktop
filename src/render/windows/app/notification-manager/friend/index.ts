import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationFriendCommand } from 'commonModule/type/preload/notification'
import { NotificationModule } from 'commonModule/type/preload/notification'

// 导入好友模块的通知处理器
import friendNotificationManager from './friend'
import friendVerifyNotificationManager from './friend-verify'

/**
 * @description: 好友模块通知路由器
 */
class FriendNotificationRouter {
  /**
   * 处理好友模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_FRIEND>) {
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