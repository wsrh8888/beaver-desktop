import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationConnectionCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { useAppStore } from '../pinia/app/app'

class ConnectionEventManager {
  constructor() {
  }

  init() {
    electron.notification.on(NotificationModule.CONNECTION, this.handle)
  }

  off() {
    electron.notification.off(NotificationModule.CONNECTION, this.handle)
  }

  handle(params: INotificationPayload<NotificationModule.CONNECTION>) {
    switch (params.command) {
      case NotificationConnectionCommand.STATUS_CHANGE:
        this.handleStatusChange(params.data)
        break
      default:
        break
    }
  }

  /**
   * 处理连接状态变更通知
   */
  private handleStatusChange(data: any) {
    // 使用全局应用store管理连接状态
    const appStore = useAppStore()
    appStore.updateConnectionStatus(data.status)

    // 可以在Vue组件中通过store响应式地显示状态变化
    // 比如在UI中显示连接状态指示器等
  }
}

export default new ConnectionEventManager()
