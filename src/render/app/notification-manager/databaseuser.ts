import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationModule, NotificationUserCommand } from 'commonModule/type/preload/notification'

class DatabaseUserEventManager {
  constructor() {
  }

  init() {
    electron.notification.on(NotificationModule.DATABASE_USER, this.handle)
  }

  off() {
    electron.notification.off(NotificationModule.DATABASE_USER, this.handle)
  }

  handle(params: INotificationPayload<NotificationModule.DATABASE_USER>) {
    switch (params.command) {
      case NotificationUserCommand.GET_USER_INFO:
        break
      default:
        break
    }
  }
}
export default new DatabaseUserEventManager()
