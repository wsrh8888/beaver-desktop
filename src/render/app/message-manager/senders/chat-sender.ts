import type { IMessage } from 'commonModule/type/ajax/chat'
import type { WsType } from 'commonModule/type/ws/command'
import { MessageType } from 'commonModule/type/ajax/chat'

/**
 * @description: 聊天消息发送器 - PC端
 */
class ChatSender {
  /**
   * @description: 发送消息
   * @param {string} conversationId - 会话ID
   * @param {any} content - 消息内容
   * @param {MessageType} type - 消息类型
   * @param {Map<string, IChatHistory>} pendingMessages - 待确认消息列表
   * @return {Promise<string>} 消息ID
   */
  async sendMessage(
    conversationId: string,
    content: any,
    messageType: MessageType,
    wsType: WsType,
  ) {
    console.log('sendMessage', conversationId, content, messageType, wsType)
    // await electron.websocket.sendChatMessage(conversationId, this.buildMessageContent(content, messageType), wsType)
  }

  /**
   * @description: 构建消息内容
   * @param {any} content - 消息内容
   * @param {MessageType} type - 消息类型
   * @return {IMessage} 消息内容对象
   */
  private buildMessageContent(content: any, type: MessageType): IMessage {
    switch (type) {
      case MessageType.TEXT:
        return {
          type: MessageType.TEXT,
          textMsg: { content },
          imageMsg: null,
          videoMsg: null,
          fileMsg: null,
          voiceMsg: null,
          emojiMsg: null,
          replyMsg: null,
        }
      case MessageType.IMAGE:
        return {
          type: MessageType.IMAGE,
          textMsg: undefined,
          imageMsg: content,
          videoMsg: null,
          fileMsg: null,
          voiceMsg: null,
          emojiMsg: null,
          replyMsg: null,
        }
      case MessageType.VOICE:
        return {
          type: MessageType.VOICE,
          textMsg: undefined,
          imageMsg: null,
          videoMsg: null,
          fileMsg: null,
          voiceMsg: content,
          emojiMsg: null,
          replyMsg: null,
        }
      case MessageType.VIDEO:
        return {
          type: MessageType.VIDEO,
          textMsg: undefined,
          imageMsg: null,
          videoMsg: content,
          fileMsg: null,
          voiceMsg: null,
          emojiMsg: null,
          replyMsg: null,
        }
      case MessageType.FILE:
        return {
          type: MessageType.FILE,
          textMsg: undefined,
          imageMsg: null,
          videoMsg: null,
          fileMsg: content,
          voiceMsg: null,
          emojiMsg: null,
          replyMsg: null,
        }
      case MessageType.AT:
        return {
          type: MessageType.AT,
          textMsg: { content: String(content) },
          imageMsg: null,
          videoMsg: null,
          fileMsg: null,
          voiceMsg: null,
          emojiMsg: null,
          replyMsg: null,
        }
      default:
        return {
          type: MessageType.TEXT,
          textMsg: { content: String(content) },
          imageMsg: null,
          videoMsg: null,
          fileMsg: null,
          voiceMsg: null,
          emojiMsg: null,
          replyMsg: null,
        }
    }
  }
}

export default new ChatSender()
