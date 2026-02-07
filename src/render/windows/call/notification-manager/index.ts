import type { INotificationPayload, NotificationModule as NM } from 'commonModule/type/preload/notification'
import callManager from '../core'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('通话窗口通知管理')

/**
 * @description: 通话窗口通知管理
 */
class NotificationManager {
  init() {
    // 获取窗口初始化参数并执行核心初始化
    const params = (electron as any).app.params
    if (params && (params.targetId || params.roomId)) {
      callManager.initialize(params)
    }

    // 监听来自主进程的通话信令
    electron.notification.on(('DATABASE_CHAT' as any) as NM, this.handleNotification)
  }

  /**
   * 处理通知
   */
  handleNotification = (params: INotificationPayload<any>) => {
    const { command, data } = params

    logger.info({
      text: '收到通话信令通知',
      data: { command, data }
    })

    switch (command) {
      case 'call_hangup':
        // 对方挂断，自动清理并关闭窗口
        logger.info({ text: '收到对方挂断信令，关闭窗口' })
        callManager.hangup()
        break
      case 'call_accepted':
        // 对方接听（主要用于 caller 侧更新 UI）
        logger.info({ text: '收到对方接听信令' })
        // 可以在这里更新状态，目前由 LiveKit 的事件自动处理
        break
      default:
        break
    }
  }

  off() {
    electron.notification.off(('DATABASE_CHAT' as any) as NM, this.handleNotification)
  }
}

export default new NotificationManager()
