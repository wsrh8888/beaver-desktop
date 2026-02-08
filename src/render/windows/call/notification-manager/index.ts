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
        // 后端下发的进入/加入指令
        // 如果是初次进入 (Store 为空)，则执行全量初始化
        if (!callStore.roomInfo.roomId && data.baseInfo) {
          callStore.setBaseInfo(data.baseInfo)
          callStore.initMembers(data.participants)
          callStore.setRoomInfo(data.roomInfo)
          callStore.setPhase(data.baseInfo.role === 'caller' ? 'calling' : 'active')
          callManager.initialize()
        } else if (data.userId) {
          // 如果是运行中收到的 JOIN，视为增量更新
          callStore.upsertMember(data.userId, { status: 'joined' })
        }
        break

      case NotificationCallCommand.CALL_ACCEPTED:
        if (data.userId) {
          callStore.upsertMember(data.userId, { status: 'joined' })
        }
        callStore.setPhase('active')
        break

      case NotificationCallCommand.CALL_REJECTED:
        if (data.userId) {
          callStore.upsertMember(data.userId, { status: 'rejected' })
          // 如果是私聊，对方拒接则全员挂断
          if (callStore.baseInfo.callType === 'private') {
            callManager.hangup()
          }
        }
        break

      case NotificationCallCommand.CALL_HANGUP:
      case NotificationCallCommand.CALL_CANCELLED:
        if (data.userId && callStore.baseInfo.callType === 'group') {
          // 群聊：仅标记该用户离开
          callStore.upsertMember(data.userId, { status: 'left' })
        } else {
          // 私聊或全员结束：执行清理
          callManager.hangup()
        }
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
