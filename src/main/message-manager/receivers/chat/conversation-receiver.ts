import { conversationBusiness } from 'mainModule/business/chat/conversation'

/**
 * @description: 会话接收器 - 处理conversations表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
export class ConversationReceiver {
  /**
   * 处理会话更新通知
   * 只处理 conversations 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 第一层循环：遍历所有的表更新
    for (const update of tableUpdates) {
      // 第二层循环：在switch中处理每种表类型
      switch (update.table) {
        case 'conversations':
          // 第三层循环：遍历data数组中的每个版本数据
          for (const dataItem of update.data) {
            if (update.conversationId && dataItem?.version) {
              await conversationBusiness.syncConversationByVersion(update.conversationId, dataItem.version)
            }
          }
          break

        // 可以扩展处理其他表，但这里只负责conversations
        default:
          // 不处理其他表的更新
          break
      }
    }
  }
}
