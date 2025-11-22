import logger from 'mainModule/utils/log'
import { ConversationReceiver } from './conversation-receiver'
import { MessageReceiver } from './message-receiver'
import { UserConversationReceiver } from './user-conversation-receiver'

/**
 * 聊天消息路由器
 * 根据消息类型路由到对应的接收器
 */
export class ChatMessageRouter {
  private messageReceiver = new MessageReceiver()
  private conversationReceiver = new ConversationReceiver()
  private userConversationReceiver = new UserConversationReceiver()

  /**
   * 处理聊天消息
   * @param wsMessage WebSocket 消息内容
   */
  async processChatMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      logger.warn({ text: '聊天消息缺少 type 字段', data: { wsMessage } }, 'ChatMessageRouter')
      return
    }

    switch (data.type) {
      // 消息发送相关的更新 - 聚合消息，包含所有表的更新，同时调用三个receiver
      case 'chat_conversation_message_receive':
        await this.messageReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 会话相关的更新 - 只调用会话receiver
      case 'chat_conversation_meta_receive':
        await this.conversationReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 用户会话相关的更新 - 只调用用户会话receiver
      case 'chat_user_conversation_receive':
        await this.userConversationReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        logger.warn({ text: '未知的聊天消息类型', data: { type: data.type } }, 'ChatMessageRouter')
    }
  }
}

// 导出单例实例
export const chatMessageRouter = new ChatMessageRouter()
