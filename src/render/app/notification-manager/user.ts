import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationModule, NotificationUserCommand } from 'commonModule/type/preload/notification'
import { useContactStore } from '../pinia/contact/contact'

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
    const contactStore = useContactStore()

    switch (params.command) {
      case NotificationUserCommand.USER_INFO_UPDATE:
        // 用户信息更新通知 - 更新联系人缓存
        if (params.data?.userId && params.data?.updates) {
          contactStore.updateContact(params.data.userId, params.data.updates)
        }
        break

      default:
        console.warn('未知的用户通知命令:', params.command)
        break
    }
  }
}
export default new DatabaseUserEventManager()
