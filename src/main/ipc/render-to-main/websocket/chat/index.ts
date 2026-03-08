import { store } from 'mainModule/store'
import type { IChatMessageSendBody } from 'commonModule/type/ws/message-types'
import { WebsocketCommand } from 'commonModule/type/ipc/websocket'
import messageBusiness from 'mainModule/business/chat/message'

class ChatHandler {
  /**
   * 处理聊天相关的 IPC 命令
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
          throw new Error('聊天消息命令处理失败')
      }
    }
    catch (error) {
      console.error('处理聊天消息失败', error)
      return { code: -1, msg: (error as Error).message }
    }
  }

  /**
   * @description: 发送消息核心业务处理 (转发给 Business 层)
   */
  private async messageSend(data: IChatMessageSendBody, userId: string): Promise<any> {
    return await messageBusiness.sendMessage(userId, data)
  }
}

export default new ChatHandler()
