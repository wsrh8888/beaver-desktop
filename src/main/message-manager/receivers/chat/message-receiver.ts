import type { ITableUpdatesBody } from 'commonModule/type/ws/message-types'
import { messageBusiness } from 'mainModule/business/chat/message'
import { conversationBusiness } from 'mainModule/business/chat/conversation'
import { userConversationBusiness } from 'mainModule/business/chat/user-conversation'
import logger from 'mainModule/utils/log'

/**
 * @description: 消息接收器 - 处理messages表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
export class MessageReceiver {

  /**
   * 主入口 - 处理消息接收
   * 通过switch判断消息类型，分别处理不同类型的消息
   */
  async handle(wsMessage: any) {
    const { data } = wsMessage

    switch (data?.type) {
      case 'private_message_receive':
      case 'group_message_receive':
        // 处理基于表的更新通知 - 私聊和群聊都使用相同的逻辑
        await this.handleTableUpdates(data.body as ITableUpdatesBody)
        break

      default:
        logger.warn({ text: '未知消息类型', data: { type: data?.type } }, 'MessageReceiver')
    }
  }

  /**
   * 处理基于表的更新通知
   * 遍历 tableUpdates，根据表类型调用对应的业务模块
   */
  private async handleTableUpdates(tableUpdatesBody: ITableUpdatesBody) {
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
          // 第三层循环：遍历data数组中的每个版本数据
          for (const dataItem of update.data) {
            if (update.userId && dataItem?.version) {
              await userConversationBusiness.syncUserConversationsByVersionRange(update.userId, dataItem.version, dataItem.version)
            }
          }
          break

        default:
          logger.warn({ text: '未知的表类型', data: { table: update.table } }, 'MessageReceiver')
      }
    }
  }
}
