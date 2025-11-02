import DatabaseFriendEventManager from './databasefriend'
import DatabaseUserEventManager from './databaseuser'

/**
 * @description: 基础事件管理中心
 */
class NotificationManager {
  init() {
    DatabaseFriendEventManager.init()
    DatabaseUserEventManager.init()
  }

  off() {
    DatabaseFriendEventManager.off()
    DatabaseUserEventManager.off()
  }
}

export default new NotificationManager()
