import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationModule, NotificationNotificationCommand } from 'commonModule/type/preload/notification'
import { useMomentNotificationStore } from '../store/notification/notification'
import { useMomentStore } from '../store/moment/moment'

class MomentInboxNotificationManager {
  init() {
    electron?.notification.on(NotificationModule.DATABASE_NOTIFICATION, this.handleNotification)
  }

  off() {
    electron?.notification.off(NotificationModule.DATABASE_NOTIFICATION, this.handleNotification)
  }

  handleNotification = async (params: INotificationPayload<NotificationModule.DATABASE_NOTIFICATION>) => {
    switch (params.command) {
      case NotificationNotificationCommand.INBOX_UPDATE:
      case NotificationNotificationCommand.READ_CURSOR_UPDATE: {
        const notificationStore = useMomentNotificationStore()
        const momentStore = useMomentStore()
        await notificationStore.handleInboxUpdate()
        await momentStore.refreshMoments()
        break
      }
      default:
        break
    }
  }
}

export default new MomentInboxNotificationManager()
