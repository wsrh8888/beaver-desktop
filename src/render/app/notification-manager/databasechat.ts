import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'

// 导入pinia stores（需要在使用的地方导入，避免循环依赖）
import { useMessageStore } from '../pinia/message/message'

class DatabaseChatEventManager {
  constructor() {
  }

  init() {
    electron.notification.on(NotificationModule.DATABASE_CHAT, this.handle)
  }

  off() {
    electron.notification.off(NotificationModule.DATABASE_CHAT, this.handle)
  }

  handle(params: INotificationPayload<NotificationModule.DATABASE_CHAT>) {
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
  private handleNewMessages(data: any) {
    // 使用 pinia 的消息管理来处理新消息
    const messageStore = useMessageStore()

    // 将消息添加到对应的会话
    for (const message of data.messages) {
      messageStore.addMessage(data.conversationId, message)
    }

    // TODO: 更新会话的未读消息计数
    // const conversationStore = useConversationStore()
    // conversationStore.updateUnreadCount(data.conversationId, data.count)

    // 可以在这里添加其他UI更新逻辑，比如显示通知、播放声音等
    console.log(`收到 ${data.count} 条新消息，会话: ${data.conversationId}`)
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
