import { NotificationModule } from 'commonModule/type/preload/notification'

// 导入各个子模块的通知路由器
import { appNotificationRouter } from './app/index'
import { chatNotificationRouter } from './chat/index'
import { emojiNotificationRouter } from './emoji/index'
import { friendNotificationRouter } from './friend/index'
import { groupNotificationRouter } from './group/index'
import { notificationNotificationRouter } from './notification/index'
import { userNotificationRouter } from './user/index'

/**
 * @description: 通知管理中心 - 统一入口，委托给子模块处理
 */
class NotificationManager {
  init() {
    // 设置全局通知监听器，委托给各个子模块的路由器处理
    electron.notification.on(NotificationModule.APP_LIFECYCLE, params => appNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_CHAT, params => chatNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.EMOJI, params => emojiNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_FRIEND, params => friendNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_GROUP, params => groupNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_NOTIFICATION, params => notificationNotificationRouter.handleNotification(params))
    electron.notification.on(NotificationModule.DATABASE_USER, params => userNotificationRouter.handleNotification(params))
  }

  off() {
    // 移除全局通知监听器
    electron.notification.off(NotificationModule.APP_LIFECYCLE, params => appNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_CHAT, params => chatNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.EMOJI, params => emojiNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_FRIEND, params => friendNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_GROUP, params => groupNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_NOTIFICATION, params => notificationNotificationRouter.handleNotification(params))
    electron.notification.off(NotificationModule.DATABASE_USER, params => userNotificationRouter.handleNotification(params))
  }
}

export default new NotificationManager()
