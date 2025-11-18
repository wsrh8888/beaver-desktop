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
    console.log('verify 收到通知', params)
    switch (params.command) {
      case NotificationSearchToVerifyCommand.SEARCH_TO_VERIFY: {
        const verifyStore = useVerifyStore()
        verifyStore.updateSearchData(params.data, params.data.type)
        break
      }
      default:
        break
    }
  }
}
export default new SearchToVerifyEventManager()
