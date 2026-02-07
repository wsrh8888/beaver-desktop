import type { INotificationPayload, NotificationModule as NM } from 'commonModule/type/preload/notification'
import Logger from 'renderModule/utils/logger'
import { useIncomingStore } from '../pinia/incoming'

const logger = new Logger('来电通知窗口通知管理')

/**
 * @description: 来电通知窗口通知管理
 */
class NotificationManager {
  init() {
    const incomingStore = useIncomingStore()

    // 获取窗口初始化参数并执行核心初始化
    const params = (electron as any)?.app?.params
    if (params) {
      logger.info({
        text: '初始化来电窗口参数',
        data: params
      })
      incomingStore.setCallInfo(params)
    }

    // 监听来自主进程的通话信令
    electron.notification.on(('DATABASE_CHAT' as any) as NM, this.handleNotification)
  }

  /**
   * 处理通知
   */
  handleNotification = (params: INotificationPayload<any>) => {
    const { command, data } = params
    const incomingStore = useIncomingStore()

    // 校验 info 是否匹配当前窗口
    // 如果窗口没有 roomId (未初始化?) 或者 通知 roomId 不匹配，忽略
    if (!incomingStore.callInfo.roomId || (data.roomId && data.roomId !== incomingStore.callInfo.roomId)) {
      return
    }

    logger.info({
      text: '收到通话信令通知',
      data: { command, data }
    })

    switch (command) {
      case 'call_hangup':
        // 对方挂断，自动清理并关闭窗口
        logger.info({ text: '收到对方挂断信令，关闭窗口' })
        electron.window.closeWindow()
        break
      case 'call_cancelled':
        // 对方取消（未接听前挂断），同挂断
        logger.info({ text: '收到取消信令，关闭窗口' })
        electron.window.closeWindow()
        break
      case 'call_accepted':
        // 其它端接听（如手机端接听），关闭本端弹窗
        logger.info({ text: '收到接听信令，关闭窗口' })
        electron.window.closeWindow()
        break
      case 'call_rejected':
        // 其它端拒绝，关闭本端弹窗
        logger.info({ text: '收到拒绝信令，关闭窗口' })
        electron.window.closeWindow()
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
