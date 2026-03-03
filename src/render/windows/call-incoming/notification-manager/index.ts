import { type INotificationPayload, NotificationModule, NotificationCallCommand } from 'commonModule/type/preload/notification'
import { useIncomingStore } from '../pinia/incoming'

/**
 * 来电通知窗口通知管理（中间层）
 *
 * 流程约定：仅在被叫场景存在；主叫不会打开本窗口。
 * - 被叫：先打开本窗口并收到 CALL_INVITE，展示来电；用户接听后再打开 call 窗口（CALL_JOIN）。
 * - 收到 ACCEPTED / REJECTED / HANGUP / CANCELLED 时关窗（接听则 call 窗口会打开，拒绝/挂断则结束）。
 */
class NotificationManager {
  init() {
    const incomingStore = useIncomingStore()
    const params = (electron as any)?.app?.params
    if (params) incomingStore.setCallInfo(params)
    electron.notification.on(NotificationModule.CALL, this.handleNotification)
  }

  handleNotification = (params: INotificationPayload<NotificationModule.CALL>) => {
    const { command, data } = params
    const roomId = data?.roomInfo?.roomId
    if (!roomId) return

    const incomingStore = useIncomingStore()
    const currentRoomId = incomingStore.callInfo.roomInfo?.roomId
    if (currentRoomId && roomId !== currentRoomId) return

    switch (command) {
      case NotificationCallCommand.CALL_INVITE:
        incomingStore.setCallInfo(data)
        break

      case NotificationCallCommand.CALL_REJECTED:
      case NotificationCallCommand.CALL_ACCEPTED:
      case NotificationCallCommand.CALL_HANGUP:
      case NotificationCallCommand.CALL_CANCELLED:
        electron.window.closeWindow()
        break
    }
  }

  off() {
    electron.notification.off(NotificationModule.CALL, this.handleNotification)
  }
}

export default new NotificationManager()
