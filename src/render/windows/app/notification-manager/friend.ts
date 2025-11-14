import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationFriendCommand, NotificationModule } from 'commonModule/type/preload/notification'

class DatabaseFriendEventManager {
  constructor() {
  }

  init() {
    electron.notification.on(NotificationModule.DATABASE_FRIEND, this.handle)
  }

  off() {
    electron.notification.off(NotificationModule.DATABASE_FRIEND, this.handle)
  }

  handle(params: INotificationPayload<NotificationModule.DATABASE_FRIEND>) {
    switch (params.command) {
      case NotificationFriendCommand.GET_FRIENDS:
        break
      case NotificationFriendCommand.GET_VALID_LIST:
        break
      default:
        break
    }
  }
}
export default new DatabaseFriendEventManager()
