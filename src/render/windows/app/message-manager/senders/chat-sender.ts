import type { MessageType } from 'commonModule/type/ajax/chat'
import { useMessageSenderStore } from '../../pinia/message/message-sender'
import { useUserStore } from '../../pinia/user/user'

/**
 * @description: 聊天消息发送器 - PC端
 */
class ChatSender {
  /**
   * @description: 生成唯一的客户端消息ID
   * @return {string} 消息ID
   */
  private generateMessageId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const userId = this.getCurrentUserId()
    return `msg_${userId}_${timestamp}_${random}`
  }

  /**
   * @description: 获取当前用户ID
   * @return {string} 用户ID
   */
  private getCurrentUserId(): string {
    const userStore = useUserStore()
    return userStore.userInfo.userId || 'unknown'
  }

  /**
   * @description: 发送消息
   * @param {string} conversationId - 会话ID
   * @param {any} content - 消息内容
   * @param {MessageType} type - 消息类型
   * @param {string} chatType - 聊天类型
   * @return {Promise<string>} 消息ID
   */
  async sendMessage(
    conversationId: string,
    content: any,
    messageType: MessageType,
    chatType: string,
  ): Promise<string> {
    // 生成唯一的客户端消息ID
    const messageId = this.generateMessageId()

    // 使用message-sender store构建消息内容
    const messageSenderStore = useMessageSenderStore()
    const localMessage = messageSenderStore.buildMessageContentInternal(content, messageType)
    const wsMessageContent = messageSenderStore.convertToWsMessageFormat(localMessage)

    // 只构建业务数据，主进程负责WebSocket消息格式
    const messageData = {
      conversationId,
      messageId,
      msg: wsMessageContent,
    }

    if (chatType === 'private') {
      await electron.websocket.chat.privateMessageSend(messageData)
    }
    else if (chatType === 'group') {
      // await electron.websocket.chat.groupMessageSend(wsMessage)
    }
    else {
      throw new Error('Invalid chat type')
    }

    return messageId
  }
}

export default new ChatSender()
