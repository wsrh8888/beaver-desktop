import logger from 'mainModule/utils/log'
import { EventReceiver } from './event-receiver'
import { InboxReceiver } from './inbox-receiver'
import { ReadCursorReceiver } from './read-cursor-receiver'

/**
 * 通知消息路由器
 * 根据消息类型路由到对应的接收器
 */
export class NotificationMessageRouter {
  private eventReceiver = new EventReceiver()
  private inboxReceiver = new InboxReceiver()
  private readCursorReceiver = new ReadCursorReceiver()

  /**
   * 处理通知消息
   * @param wsMessage WebSocket 消息内容
   */
  async processNotificationMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      logger.warn({ text: '通知消息缺少 type 字段', data: { wsMessage } }, 'NotificationMessageRouter')
      return
    }

    switch (data.type) {
      // 通知推送消息
      case 'notification_receive':
        await this.inboxReceiver.handleTableUpdates(wsMessage.data.body)
        await this.readCursorReceiver.handleTableUpdates(wsMessage.data.body)
        await this.eventReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 标记已读同步消息
      case 'notification_mark_read_receive':
        await this.readCursorReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        logger.warn({ text: '未知的通知消息类型', data: { type: data.type } }, 'NotificationMessageRouter')
    }
  }
}
// 导出单例实例
export const notificationMessageRouter = new NotificationMessageRouter()
