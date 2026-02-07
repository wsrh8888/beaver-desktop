import { NotificationModule } from 'commonModule/type/preload/notification'
import { usecallStore } from '../pinia/call'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('通话窗口通知管理')

/**
 * @description: 通话窗口通知管理
 */
class NotificationManager {
  init() {
    // 监听通话信令
    electron.notification.on(NotificationModule.DATABASE_CHAT as any, this.handleNotification)
  }

  /**
   * 处理通知
   */
  handleNotification = (params: any) => {
    if (params.command === 'call_signal') {
      this.handleCallSignal(params.data)
    }
  }

  /**
   * 处理通话信令
   */
  handleCallSignal(data: any) {
    logger.info({
      text: '收到通话信令',
      data,
    })
    const callStore = usecallStore()

    if (data.type === 'RTC_HANGUP' && data.roomId === callStore.roomId) {
      (window as any).electron?.window.closeWindow('call')
    }
  }

  off() {
    electron.notification.off(NotificationModule.DATABASE_CHAT as any, this.handleNotification)
  }
}

export default new NotificationManager()
