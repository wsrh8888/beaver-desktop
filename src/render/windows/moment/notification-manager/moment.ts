import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationModule, NotificationMediaViewerCommand } from 'commonModule/type/preload/notification'
import { useMomentStore } from '../store/moment/moment'

class MomentEventManager {
  constructor() {
  }

  init() {
    electron?.notification.on(NotificationModule.MEDIA_VIEWER, this.handleNotification)
  }

  off() {
    electron?.notification.off(NotificationModule.MEDIA_VIEWER, this.handleNotification)
  }

  handleNotification(params: INotificationPayload<NotificationModule.MEDIA_VIEWER>) {
    console.log('moment 收到通知', params)
    switch (params.command) {
      case NotificationMediaViewerCommand.UPDATE_MOMENT: {
        const momentStore = useMomentStore()
        momentStore.refreshMoments()
        break
      }
      default:
        break
    }
  }
}

export default new MomentEventManager()
