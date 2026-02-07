import { NotificationModule } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'
import callApp from 'mainModule/application/call'

/**
 * @description: RTC消息处理器 - 处理来自WebSocket的RTC信令
 */
class RTCMessageRouter {
  /**
   * 处理RTC相关消息
   * @param content 消息内容
   */
  processRTCMessage(content: any) {
    logger.info({
      text: '收到RTC信令内容',
      data: content,
    }, 'RTCMessageRouter')

    const { data } = content
    if (!data) return

    if (data.type === 'RTC_INVITE') {
      // 如果收到邀请，打开通话窗口
      callApp.createBrowserWindow({
        roomId: data.roomId,
        callType: data.callType,
        targetId: data.callerId,
        role: 'callee'
      })
    }

    // 转发给渲染进程（用于已打开的通话窗口内接收挂断等信令）
    sendMainNotification('*', NotificationModule.DATABASE_CHAT as any, 'rtc_signal' as any, data)
  }
}

export default new RTCMessageRouter()
