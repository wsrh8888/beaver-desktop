import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationChatCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入聊天模块的通知处理器
import conversationNotificationManager from './conversation'
import messageNotificationManager from './message'
import userConversationNotificationManager from './user-conversation'
import callNotificationManager from './call'

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

    // 处理通话相关的自定义命令（string 类型，来自主进程的自定义信令）
    const command = params.command as any
    if (command === 'call_invite') {
      await callNotificationManager.processCallInvite(params.data)
      return
    }
    if (command === 'call_ended') {
      callNotificationManager.processCallEnded(params.data)
      return
    }

    // 处理标准通知命令
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
