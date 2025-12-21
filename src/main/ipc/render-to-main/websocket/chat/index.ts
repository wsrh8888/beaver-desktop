import { WsType } from 'commonModule/type/ws/command'
import { store } from 'mainModule/store'
import chatSender from '../senders/chat-sender'

class ChatHandler {
  /**
   * 处理用户相关的数据库命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: WsType, data: any): Promise<any> {
    const userStore = store.get('userInfo')
    try {
      if (!userStore?.userId) {
        throw new Error('用户未登录')
      }
      switch (command) {
        case WsType.PRIVATE_MESSAGE_SEND:
          return await chatSender.sendPrivateMessage(data.conversationId, data, userStore.userId)
        default:
          throw new Error('好友数据库命令处理失败')
      }
    }
    catch (error) {
      console.error('处理聊天消息失败', error)
      return false
    }
  }
}

export default new ChatHandler()
