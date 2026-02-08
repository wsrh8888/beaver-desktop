import { NotificationModule, NotificationCallCommand, type INotificationPayload } from 'commonModule/type/preload/notification'
import callManager from '../core'
import { usecallStore } from '../pinia/call'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('通话窗口通知管理')

/**
 * @description: 通话窗口通知管理
 */
class NotificationManager {
  init() {
    // 监听来自主进程的通话信令
    electron.notification.on(NotificationModule.CALL, this.handleNotification)
  }

  /**
   * 处理通知
   */
  handleNotification = (params: INotificationPayload<NotificationModule.CALL>) => {
    const { command, data } = params
    const callStore = usecallStore()

    // 1. 提取 roomId (严格遵循 roomInfo 嵌套标准)
    const roomId = data?.roomInfo?.roomId
    if (!roomId) {
      logger.error({ text: '收到通话控制信令，但缺少 roomInfo.roomId', data })
      return
    }

    // 2. 校验 roomId (一旦锁定房间，只处理该房间的信令)
    const currentRoomId = callStore.roomInfo.roomId
    if (currentRoomId && roomId !== currentRoomId) {
      logger.warn({ text: '收到通话控制信令，但 roomId 不匹配', data: { received: roomId, current: currentRoomId } })
      return
    }

    logger.info({
      text: '收到通话控制信令',
      data: { command, data }
    })

    switch (command) {
      case NotificationCallCommand.CALL_START:
      case NotificationCallCommand.CALL_JOIN:
        callStore.setBaseInfo(data.baseInfo)
        callStore.setRoomInfo(data.roomInfo)
        callStore.setPhase(data.baseInfo.role === 'caller' ? 'calling' : 'active')
        // 初始化通话/更新基础数据
        callManager.initialize()
        break

      case NotificationCallCommand.CALL_ACCEPTED:
        // 对方已接听 (对于主叫方，UI 切换到通话中)
        callStore.setPhase('active')
        break

      case NotificationCallCommand.CALL_REJECTED:
      case NotificationCallCommand.CALL_HANGUP:
      case NotificationCallCommand.CALL_CANCELLED:
        // 挂断并执行清理逻辑
        callManager.hangup()
        break

      default:
        break
    }
  }

  off() {
    electron.notification.off(NotificationModule.CALL, this.handleNotification)
  }
}

export default new NotificationManager()
