import type { IWsData } from 'commonModule/type/ws/command'
import { WsType } from 'commonModule/type/ws/command'
import { MessageService } from 'mainModule/database/services/chat/message'
import wsManager from 'mainModule/ws-manager'

/**
 * @description: 聊天消息发送器 - IPC层版本
 */
export class ChatSender {
  /**
   * @description: 发送私聊消息
   * @param conversationId 会话ID
   * @param messageData 消息数据（由渲染进程构建）
   * @param userId 发送者用户ID
   * @return Promise<boolean>
   */
  static async sendPrivateMessage(
    conversationId: string,
    messageData: any,
    userId: string,
  ): Promise<boolean> {
    const { messageId, msg } = messageData

    // 1. 保存消息到本地数据库（发送中状态）
    await MessageService.create({
      messageId,
      conversationId,
      conversationType: 1, // 私聊
      sendUserId: userId,
      msgType: msg.type,
      msgPreview: this.generateMessagePreview(msg),
      msg: JSON.stringify(msg),
      seq: 0, // 临时seq，实际seq由服务器返回
      sendStatus: 0, // 发送状态：发送中（客户端新消息）
      createAt: new Date().toISOString(),
    })

    // 2. 立即返回，让前端可以显示消息（大厂IM的标准做法）
    // 消息已保存在数据库中，前端可以通过数据库查询或WebSocket推送获取

    // 2. 构建WebSocket消息并发送
    const wsData: IWsData<WsType.PRIVATE_MESSAGE_SEND> = {
      type: WsType.PRIVATE_MESSAGE_SEND,
      conversationId,
      body: messageData,
    }

    const wsMessage = {
      command: 'CHAT_MESSAGE',
      content: {
        timestamp: Date.now(),
        messageId,
        data: wsData,
      },
    }

    wsManager.sendMessage(wsMessage)
    return true
  }

  /**
   * 生成消息预览文本
   */
  private static generateMessagePreview(msg: any): string {
    switch (msg.type) {
      case 1: // 文本消息
        return msg.textMsg?.content || '[文本消息]'
      case 2: // 图片消息
        return '[图片]'
      case 3: // 视频消息
        return '[视频]'
      case 4: // 文件消息
        return `[文件] ${msg.fileMsg?.fileName || ''}`
      case 5: // 语音消息
        return '[语音]'
      case 6: // 表情消息
        return '[表情]'
      case 7: // 撤回消息
        return '[消息已撤回]'
      case 8: // 删除消息
        return '[消息已删除]'
      case 9: // 系统消息
        return '[系统消息]'
      default:
        return '[未知消息]'
    }
  }
}
