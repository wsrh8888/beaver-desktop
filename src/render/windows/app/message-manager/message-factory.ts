import type { IChatHistory, IMessage } from 'commonModule/type/ajax/chat'
import { MessageType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import type { IChatMessageSendBody } from 'commonModule/type/ws/message-types'

/**
 * @description: 消息工厂类 - 处理消息对象的构建和协议转换
 * 纯函数逻辑，不包含 Store 状态
 */
export class MessageFactory {
  /**
   * @description: 生成唯一的客户端消息ID
   */
  static generateMessageId(userId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `msg_${userId}_${timestamp}_${random}`
  }

  /**
   * @description: 构建本地 IMessage 结构 (用于 UI 展示)
   * @param content 原始输入内容
   * @param type 消息类型
   * @param replyTo 被引用的原始消息
   */
  static buildLocalMessage(content: any, type: MessageType, replyTo?: IChatHistory | null): IMessage {
    const msg: any = { type }

    switch (type) {
      case MessageType.TEXT:
        msg.textMsg = { content: typeof content === 'string' ? content : (content.text || '') }
        break
      case MessageType.REPLY:
        if (replyTo) {
          msg.replyMsg = {
            originMsgId: replyTo.messageId,
            originMsg: replyTo.msg, // 快照
            replyMsg: {
              type: MessageType.TEXT,
              textMsg: { content: typeof content === 'string' ? content : (content.text || '') }
            }
          }
        }
        break
      case MessageType.IMAGE:
        msg.imageMsg = content
        break
      case MessageType.VIDEO:
        msg.videoMsg = content
        break
      case MessageType.FILE:
        msg.fileMsg = content
        break
      case MessageType.VOICE:
        msg.voiceMsg = content
        break
      case MessageType.AUDIO_FILE:
        msg.audioFileMsg = content
        break
      case MessageType.EMOJI:
        msg.emojiMsg = content
        break
      case MessageType.WITHDRAW:
        msg.withdrawMsg = content
        break
      default:
        // 未知类型回退到文本
        msg.type = MessageType.TEXT
        msg.textMsg = { content: JSON.stringify(content) }
    }

    return msg as IMessage
  }

  /**
   * @description: 构建用于本地展示/存储的完整历史记录项
   */
  static buildHistoryItem(
    userId: string,
    userInfo: { avatar: string; nickName: string },
    conversationId: string,
    messageId: string,
    msgModel: IMessage,
    status: number = 0
  ): IChatHistory {
    return {
      id: 0,
      messageId,
      conversationId,
      seq: 0,
      msg: msgModel,
      sender: {
        userId,
        avatar: userInfo.avatar,
        nickName: userInfo.nickName,
      },
      created_at: new Date().toISOString(),
      sendStatus: status,
    }
  }

  /**
   * @description: 构建用于发送的协议包
   */
  static buildChatMessageBody(
    conversationId: string,
    messageId: string,
    msgModel: IMessage,
    chatType: 'private' | 'group'
  ): IChatMessageSendBody {
    return {
      conversationId,
      messageId,
      msg: this.convertToWsFormat(msgModel),
      chatType
    }
  }

  /**
   * @description: 将本地 IMessage 转换为 WebSocket/RPC 传输格式
   */
  static convertToWsFormat(message: IMessage): IMessageMsg {
    const base: any = {
      type: message.type,
      textMsg: message.textMsg,
      imageMsg: message.imageMsg,
      videoMsg: message.videoMsg,
      fileMsg: message.fileMsg,
      voiceMsg: message.voiceMsg,
      emojiMsg: message.emojiMsg,
      notificationMsg: message.notificationMsg,
      audioFileMsg: message.audioFileMsg,
      callMsg: message.callMsg,
    }

    // 处理复合/嵌套类型 (递归转换)
    if (message.type === MessageType.REPLY && message.replyMsg) {
      base.replyMsg = {
        originMsgId: message.replyMsg.originMsgId,
        originMsg: message.replyMsg.originMsg,
        replyMsg: this.convertToWsFormat(message.replyMsg.replyMsg)
      }
    }

    return base as IMessageMsg
  }
}
