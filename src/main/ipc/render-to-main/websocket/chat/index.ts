import { WsType } from 'commonModule/type/ws/command'
import messageManager from 'mainModule/message-manager'
import { store } from 'mainModule/store'

export class ChatHandler {
  /**
   * 处理用户相关的数据库命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: WsType, data: any): Promise<any> {
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }
    switch (command) {
      case WsType.PRIVATE_MESSAGE_SEND:
        return await messageManager.chatSender.sendMessage(data.conversationId, data.content, WsType.PRIVATE_MESSAGE_SEND)
      default:
        throw new Error('好友数据库命令处理失败')
    }
  }
}
