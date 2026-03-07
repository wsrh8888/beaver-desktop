import { store } from 'mainModule/store'
import type { IChatMessageSendBody } from 'commonModule/type/ws/message-types'
import { WebsocketCommand } from 'commonModule/type/ipc/websocket'
import { WsType } from 'commonModule/type/ws/command'
import wsManager from 'mainModule/ws-manager'
import dBServiceMessage from 'mainModule/database/services/chat/message'
import { generateMessagePreview } from 'commonModule/utils/conversation/message'

class ChatHandler {
  /**
   * 处理用户相关的数据库命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: WebsocketCommand, data: any): Promise<any> {
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }

    try {
      switch (command) {
        case WebsocketCommand.MESSAGE_SEND:
          return await this.messageSend(data as IChatMessageSendBody, userStore.userId)
        default:
          throw new Error('好友数据库命令处理失败')
      }
    }
    catch (error) {
      console.error('处理聊天消息失败', error)
      return false
    }
  }

  /**
   * @description: 发送消息核心业务处理
   */
  private async messageSend(data: IChatMessageSendBody, userId: string): Promise<boolean> {
    const { conversationId, messageId, msg, chatType } = data

    // 1. 本地存储 (DB)
    await dBServiceMessage.create({
      messageId,
      conversationId,
      conversationType: chatType === 'private' ? 1 : 2,
      sendUserId: userId,
      msgType: msg.type,
      msgPreview: generateMessagePreview(msg),
      msg: JSON.stringify(msg),
      seq: 0,
      sendStatus: 0,
    })

    // 2. 映射 WS 通讯协议类型
    const wsType = chatType === 'private'
      ? WsType.PRIVATE_MESSAGE_SEND
      : WsType.GROUP_MESSAGE_SEND

    // 3. 构造并发送 WS
    const wsMessage = {
      command: 'CHAT_MESSAGE',
      content: {
        timestamp: Date.now(),
        messageId,
        data: {
          type: wsType,
          conversationId,
          body: data,
        },
      },
    }

    wsManager.sendMessage(wsMessage)
    return true
  }
}

export default new ChatHandler()
