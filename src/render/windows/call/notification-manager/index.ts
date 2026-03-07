import { NotificationModule, NotificationCallCommand, type INotificationPayload } from 'commonModule/type/preload/notification'
import callManager from '../core'
import { usecallStore } from '../pinia/call'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('通话窗口通知管理')

/**
 * 通话窗口通知管理
 *
 * 流程约定：
 * - 自己发起（主叫）：直接打开本窗口，主进程发 CALL_START，不经过 call-incoming。
 * - 别人发起（被叫）：先打开 call-incoming（CALL_INVITE），用户接听后才打开本窗口并发 CALL_JOIN。
 * 因此本窗口不会收到 CALL_INVITE，只处理 CALL_START / CALL_JOIN（进房）及后续状态信令。
 */
class NotificationManager {
  init() {
    electron.notification.on(NotificationModule.CALL, this.handleNotification)
  }

  handleNotification = (params: INotificationPayload<NotificationModule.CALL>) => {
    const { command, data } = params
    const callStore = usecallStore()

    const roomId = data?.roomInfo?.roomId
    if (!roomId) {
      logger.error({ text: '收到通话信令但缺少 roomInfo.roomId', data })
      return
    }
    const currentRoomId = callStore.roomInfo.roomId
    if (currentRoomId && roomId !== currentRoomId) {
      logger.warn({ text: 'roomId 不匹配，忽略', data: { received: roomId, current: currentRoomId } })
      return
    }

    switch (command) {
      case NotificationCallCommand.CALL_START:  // 主叫：打开本窗口时由主进程发送
      case NotificationCallCommand.CALL_JOIN:  // 被叫接听后打开本窗口时发送，或群聊有人加入
        if (!callStore.roomInfo.roomId && data.baseInfo) {
          callStore.setBaseInfo(data.baseInfo)
          callStore.initMembers(data.participants)
          callStore.setRoomInfo(data.roomInfo)
          callManager.initialize()
        } else if (data.userId) {
          callStore.upsertMember(data.userId, { status: 'joined' })
        }
        break

      case NotificationCallCommand.CALL_INVITE:
        // 当自己邀请了别人，或者别人邀请了新人到本群聊房间时
        if (data.userId) {
          callStore.upsertMember(data.userId, { status: 'calling' })
        }
        break

      case NotificationCallCommand.CALL_ACCEPTED:
        if (data.userId) callStore.upsertMember(data.userId, { status: 'joined' })
        break

      case NotificationCallCommand.CALL_REJECTED:
        if (data.userId) {
          callStore.upsertMember(data.userId, { status: 'rejected' })
          if (callStore.baseInfo.callType === 'private') callManager.hangup()
        }
        break

      case NotificationCallCommand.CALL_HANGUP:
      case NotificationCallCommand.CALL_CANCELLED:
        if (data.userId && callStore.baseInfo.callType === 'group') {
          callStore.upsertMember(data.userId, { status: 'left' })
        } else {
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
