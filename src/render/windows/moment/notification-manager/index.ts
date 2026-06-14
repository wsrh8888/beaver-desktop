import MomentEventManager from './moment'
import MomentInboxNotificationManager from './inbox'

/**
 * @description: 事件中心
 */
class NotificationManager {
  init() {
    MomentEventManager.init()
    MomentInboxNotificationManager.init()
  }

  off() {
    MomentEventManager.off()
    MomentInboxNotificationManager.off()
  }
}

export default new NotificationManager()