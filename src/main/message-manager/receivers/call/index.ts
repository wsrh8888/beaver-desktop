import { NotificationModule, NotificationCallCommand } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'

/**
 * @description: 通话消息处理器 - 处理来自WebSocket的通话信令
 * 
 * 流程说明:
 * 1. 收到 RTC_INVITE -> 通知 app 窗口更新通话列表（不直接弹窗）
 * 2. 用户在 app 窗口点击某个来电 -> 打开 call-incoming 窗口
 * 3. 用户接听 -> 打开完整的 call 窗口
 */
class CallMessageRouter {
  /**
   * 处理通话相关消息
   * @param content 消息内容
   */
  processCallMessage(content: any) {
    logger.info({
      text: '收到通话信令内容',
      data: content,
    }, 'CallMessageRouter')

    const { data } = content
    if (!data) return

    let payload = data
    // 如果是 call_receive 类型，取 body 为实际负载
    if (data.type === 'call_receive' && data.body) {
      payload = { ...data.body, conversationId: data.conversationId }
    }

    switch (payload.type) {
      case 'RTC_INVITE':
        this.handleInvite(payload)
        break
      case 'RTC_ACCEPTED':
        this.handleAccepted(payload)
        break
      case 'RTC_HANGUP':
      case 'RTC_CANCEL':
        this.handleHangup(payload)
        break
      default:
        logger.warn({ text: '未知的 RTC 信令类型', data: { type: payload.type, origin: data.type } }, 'CallMessageRouter')
    }
  }

  /**
   * 处理来电邀请 - 只通知 app 窗口更新列表，不直接弹窗
   */
  private handleInvite(data: any) {
    // 通知 app 窗口更新通话列表
    sendMainNotification('app', NotificationModule.CALL, NotificationCallCommand.CALL_INVITE, {
      roomInfo: {
        roomId: data.roomId,
      },
      callType: data.callType, // 1-私聊, 2-群聊
      callerId: data.callerId,
      conversationId: data.conversationId || '',
      timestamp: data.timestamp
    })

    logger.info({ text: '已通知 app 窗口更新通话列表', data }, 'CallMessageRouter')
  }

  /**
   * 处理对方接听
   */
  private handleAccepted(data: any) {
    const payload = {
      ...data,
      roomInfo: {
        roomId: data.roomId,
      }
    }
    // 转发给通话窗口
    sendMainNotification('call', NotificationModule.CALL, NotificationCallCommand.CALL_ACCEPTED, payload)
    sendMainNotification('call-incoming', NotificationModule.CALL, NotificationCallCommand.CALL_ACCEPTED, payload)
    logger.info({ text: '对方已接听', data }, 'CallMessageRouter')
  }

  /**
   * 处理挂断/取消
   */
  private handleHangup(data: any) {
    const payload = {
      ...data,
      roomInfo: {
        roomId: data.roomId,
      }
    }
    // 转发给通话窗口
    sendMainNotification('call', NotificationModule.CALL, NotificationCallCommand.CALL_HANGUP, payload)
    sendMainNotification('call-incoming', NotificationModule.CALL, NotificationCallCommand.CALL_HANGUP, payload)

    // 通知 app 窗口更新通话列表（移除该通话）
    sendMainNotification('app', NotificationModule.CALL, NotificationCallCommand.CALL_ENDED, {
      roomInfo: {
        roomId: data.roomId,
      }
    })

    logger.info({ text: '通话已挂断/取消', data }, 'CallMessageRouter')
  }
}

export default new CallMessageRouter()
