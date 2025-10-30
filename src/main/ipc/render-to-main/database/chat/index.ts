import { DataChatCommand } from 'commonModule/type/ipc/database'
import { MessageService } from 'mainModule/database/services/chat/message'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'
import { store } from 'mainModule/store'

export class ChatHandler {
  /**
   * 处理聊天相关的数据库命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DataChatCommand, data: any, header: any = {}): Promise<any> {
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }
    switch (command) {
      case DataChatCommand.GET_RECENT_CHAT_LIST:
        return await ChatUserConversationService.getUserConversations(header, data)
      case DataChatCommand.GET_CONVERSATION_INFO:
        return await ChatUserConversationService.getConversationInfo(header, data)
      case DataChatCommand.GET_CHAT_HISTORY:
        return await MessageService.getChatHistory(header, data)
      case DataChatCommand.GET_CHAT_MESSAGES_BY_SEQ_RANGE:
        return await MessageService.getChatMessagesBySeqRange(header, data)
      case DataChatCommand.GET_CHAT_CONVERSATIONS_BY_VER_RANGE:
        return await ChatUserConversationService.getChatConversationsByVerRange(header, data)
      default:
        throw new Error('聊天数据库命令处理失败')
    }
  }
}
