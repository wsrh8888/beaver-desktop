import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationChatCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入聊天模块的通知处理器
import conversationNotificationManager from './conversation'
import messageNotificationManager from './message'
import userConversationNotificationManager from './user-conversation'

const logger = new Logger('聊天模块通知路由器')
/**
 * @description: 聊天模块通知路由器
 */
class ChatNotificationRouter {
  /**
   * 处理聊天模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_CHAT>) {
    logger.info({
      text: '收到聊天模块通知',
      data: params,
    })
    switch (params.command) {
      case NotificationChatCommand.CONVERSATION_UPDATE:
        await conversationNotificationManager.processConversationUpdate(params.data)
        break
      case NotificationChatCommand.MESSAGE_UPDATE:
        await messageNotificationManager.processMessageUpdate(params.data)
        break
      case NotificationChatCommand.USER_CONVERSATION_UPDATE:
        await userConversationNotificationManager.processUserConversationUpdate(params.data)
        break
      default:
        console.warn('未知的聊天通知命令:', params.command)
    }
  }
}

export const chatNotificationRouter = new ChatNotificationRouter()
