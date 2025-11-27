import { conversationBusiness } from 'mainModule/business/chat/conversation'
import { messageBusiness } from 'mainModule/business/chat/message'
import { userConversationBusiness } from 'mainModule/business/chat/user-conversation'

/**
 * @description: 消息接收器 - 处理messages表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
export class MessageReceiver {
  /**
   * 处理消息更新通知
   * 只处理 messages 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 第一层循环：遍历所有的表更新
    for (const update of tableUpdates) {
      // 第二层循环：在switch中处理每种表类型
      switch (update.table) {
        case 'messages':
          // 第三层循环：遍历data数组中的每个版本数据
          for (const dataItem of update.data) {
            if (update.conversationId && dataItem?.seq) {
              await messageBusiness.syncMessagesByVersion(update.conversationId, dataItem.seq)
            }
          }
          break

        case 'conversations':
          // 第三层循环：遍历data数组中的每个版本数据
          for (const dataItem of update.data) {
            if (update.conversationId && dataItem?.version) {
              await conversationBusiness.syncConversationByVersion(update.conversationId, dataItem.version)
            }
          }
          break

        case 'user_conversations':
          // 对于聚合消息中的用户会话更新，也使用队列处理
          for (const dataItem of update.data) {
            if (update.userId && update.conversationId && dataItem?.version) {
              await userConversationBusiness.handleTableUpdates(update.userId, update.conversationId, dataItem.version)
            }
          }
          break

        default:
          // 忽略未知表的更新
          break
      }
    }
  }
}
