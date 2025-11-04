import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/log'
// 导入pinia stores（需要在使用的地方导入，避免循环依赖）
import { useMessageStore } from '../pinia/message/message'

const logger = new Logger('DatabaseChatEventManager')

class DatabaseChatEventManager {
  constructor() {
    // 绑定方法以保持 this 上下文
    this.handle = this.handle.bind(this)
  }

  init() {
    electron.notification.on(NotificationModule.DATABASE_CHAT, this.handle)
  }

  off() {
    electron.notification.off(NotificationModule.DATABASE_CHAT, this.handle)
  }

  handle(params: INotificationPayload<NotificationModule.DATABASE_CHAT>) {
    logger.info({
      text: '收到聊天消息通知',
      data: params,
    })
    switch (params.command) {
      case NotificationChatCommand.NEW_MESSAGES:
        this.handleNewMessages(params.data)
        break
      case NotificationChatCommand.MESSAGE_STATUS_UPDATE:
        this.handleMessageStatusUpdate(params.data)
        break
      default:
        break
    }
  }

  /**
   * 处理新消息通知
   */
  private async handleNewMessages(data: any) {
    const { conversationId, seqRange, count } = data

    logger.info({
      text: `收到新消息通知，seq范围: ${seqRange.min}-${seqRange.max}`,
      data: { conversationId, seqRange, count },
    })

    // 使用 pinia 的消息管理来处理新消息
    const messageStore = useMessageStore()

    try {
      // 根据 seq 范围主动拉取消息数据
      await messageStore.fetchMessagesBySeqRange(conversationId, seqRange.min, seqRange.max)

      // TODO: 更新会话的未读消息计数
      // const conversationStore = useConversationStore()
      // conversationStore.updateUnreadCount(conversationId, count)

      // 可以在这里添加其他UI更新逻辑，比如显示通知、播放声音等
      logger.info({
        text: `成功处理 ${count} 条新消息`,
        data: { conversationId, seqRange },
      })
    }
    catch (error) {
      logger.error({
        text: '处理新消息通知失败',
        data: { conversationId, seqRange, error: (error as Error).message },
      })
    }
  }

  /**
   * 处理消息状态更新通知
   */
  private handleMessageStatusUpdate(data: any) {
    // 处理消息状态更新，比如消息已读、发送状态等
    // const messageStore = useMessageStore()
    // messageStore.updateMessageStatus(data.messageId, data.status)

    console.log('消息状态更新:', data)
  }
}

export default new DatabaseChatEventManager()
