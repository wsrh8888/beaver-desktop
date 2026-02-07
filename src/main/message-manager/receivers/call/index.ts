import { NotificationModule } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'
import callApp from 'mainModule/application/call'

/**
 * @description: 通话消息处理器 - 处理来自WebSocket的通话信令
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
    sendMainNotification('*', NotificationModule.DATABASE_CHAT as any, 'call_signal' as any, data)
  }
}

export default new CallMessageRouter()
