import DatabaseChatEventManager from './chat'
import DatabaseFriendEventManager from './friend'
import DatabaseUserEventManager from './user'

/**
 * @description: 基础事件管理中心
 */
class NotificationManager {
  init() {
    DatabaseFriendEventManager.init()
    DatabaseUserEventManager.init()
    DatabaseChatEventManager.init()
  }

  off() {
    DatabaseFriendEventManager.off()
    DatabaseUserEventManager.off()
    DatabaseChatEventManager.off()
  }
}

export default new NotificationManager()
