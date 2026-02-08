import { type INotificationPayload, NotificationModule, NotificationCallCommand } from 'commonModule/type/preload/notification'
import { useIncomingStore } from '../pinia/incoming'

/**
 * @description: 来电通知窗口通知管理
 */
class NotificationManager {
  init() {
    const incomingStore = useIncomingStore()

    // 1. 获取窗口初始化参数
    const params = (electron as any)?.app?.params
    if (params) incomingStore.setCallInfo(params)

    // 2. 监听来自主进程的通话信令
    electron.notification.on(NotificationModule.CALL, this.handleNotification)
  }

  /**
   * 处理通知
   */
  handleNotification = (params: INotificationPayload<NotificationModule.CALL>) => {
    const { command, data } = params

    // 1. 提取 roomId (严格遵循 roomInfo 嵌套标准)
    const roomId = data?.roomInfo?.roomId
    if (!roomId) return

    const incomingStore = useIncomingStore()
    const currentRoomId = incomingStore.callInfo.roomInfo?.roomId

    // 2. 语义校准：如果 Store 已有房间号，则必须匹配；如果 Store 是空的，则允许执行初始化
    if (currentRoomId && roomId !== currentRoomId) return

    switch (command) {
      case NotificationCallCommand.CALL_INVITE:
        // 初始化或同步基础信息
        incomingStore.setCallInfo(data)
        break

      case NotificationCallCommand.CALL_REJECTED:
      case NotificationCallCommand.CALL_ACCEPTED:
      case NotificationCallCommand.CALL_HANGUP:
      case NotificationCallCommand.CALL_CANCELLED:
        // 通话状态变更，关闭本端弹窗
        electron.window.closeWindow()
        break
    }
  }

  off() {
    electron.notification.off(NotificationModule.CALL, this.handleNotification)
  }
}

export default new NotificationManager()
