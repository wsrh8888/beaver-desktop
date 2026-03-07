import type { IChatMessageSendBody } from 'commonModule/type/ws/message-types'

/**
 * @description: 聊天消息发送器 - PC端管道化实现
 * 只负责将打包好的协议数据发送到 WS 链路
 */
class ChatSender {
  /**
   * @description: 发送 WebSocket 协议消息
   * @param messageData 协议体
   */
  async sendToWs(
    messageData: IChatMessageSendBody,
  ): Promise<void> {
    await electron.websocket.chat.sendMessage(messageData)
  }
}

export default new ChatSender()
