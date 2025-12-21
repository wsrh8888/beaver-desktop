import type { GetWsMessageBody, IWsData, WsType } from 'commonModule/type/ws/command'

import WsManager from 'mainModule/ws-manager/index'
import { v4 as uuidv4 } from 'uuid'

/**
 * @description: 聊天消息发送器 - 主进程版本
 */
class ChatSender {
  /**
   * @description: 发送消息
   * @param {string} conversationId - 会话ID
   * @param {GetWsMessageBody<T>} content - 消息内容
   * @param {T} type - 消息类型
   * @param {Map<string, IChatHistory>} pendingMessages - 待确认消息列表
   * @return {Promise<string>} 消息ID
   */
  async sendMessage<T extends WsType>(
    conversationId: string,
    content: GetWsMessageBody<T>,
    type: T,
  ): Promise<string> {
    const messageId = uuidv4()

    // 构建消息对象
    const message: IWsData<T> = {
      type,
      conversationId,
      body: content,
    }

    // 通过 WebSocket 发送消息
    this.sendToWebSocket(message)

    return messageId
  }

  /**
   * @description: 通过 WebSocket 发送消息
   * @param {IWsData<T>} message - 消息对象
   * @param {string} messageId - 消息ID
   */
  private sendToWebSocket<T extends WsType>(message: IWsData<T>) {
    WsManager.sendMessage({
      command: 'CHAT_MESSAGE',
      content: {
        timestamp: Date.now(),
        messageId: uuidv4(),
        data: message,
      },
    })
  }
}

export default new ChatSender()