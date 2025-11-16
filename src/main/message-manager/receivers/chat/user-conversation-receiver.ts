import { userConversationBusiness } from 'mainModule/business/chat/user-conversation'

/**
 * @description: 用户会话接收器 - 处理user_conversations表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
export class UserConversationReceiver {

  /**
   * 处理用户会话更新通知
   * 只处理 user_conversations 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 过滤出只包含 user_conversations 的更新
    const userConversationUpdates = tableUpdates.filter((update: any) => update.table === 'user_conversations')

    if (userConversationUpdates.length > 0) {
      // 使用business的队列处理机制，避免频繁请求
      await userConversationBusiness.handleTableUpdates(userConversationUpdates)
    }
  }
}
