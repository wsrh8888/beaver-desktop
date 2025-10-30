import DatabaseFriendEventManager from './databasefriend'

/**
 * @description: 事件中心
 */
class NotificationManager {
  init() {
    DatabaseFriendEventManager.init()
  }

  off() {
    DatabaseFriendEventManager.off()
  }
}

export default new NotificationManager()
