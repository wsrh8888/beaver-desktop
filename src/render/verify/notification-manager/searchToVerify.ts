import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationModule, NotificationSearchToVerifyCommand } from 'commonModule/type/preload/notification'
import { useVerifyStore } from '../pinia/verify'

class SearchToVerifyEventManager {
  constructor() {
  }

  init() {
    electron.notification.on(NotificationModule.SEARCH_TO_VERIFY, this.handle)
  }

  off() {
    electron.notification.off(NotificationModule.SEARCH_TO_VERIFY, this.handle)
  }

  handle(params: INotificationPayload<NotificationModule.SEARCH_TO_VERIFY>) {
    switch (params.command) {
      case NotificationSearchToVerifyCommand.SEARCH_TO_VERIFY: {
        const verifyStore = useVerifyStore()
        verifyStore.updateSearchData(params.data, 'friend')
        break
      }
      default:
        break
    }
  }
}
export default new SearchToVerifyEventManager()
