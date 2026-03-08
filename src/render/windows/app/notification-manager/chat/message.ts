import Logger from 'renderModule/utils/logger'
import { useMessageStore } from '../../pinia/message/message'
import { useConversationStore } from '../../pinia/conversation/conversation'
import { useMessageViewStore } from '../../pinia/view/message'

const logger = new Logger('DatabaseChatMessageEventManager')

class DatabaseChatMessageEventManager {
  /**
   * 处理未读数更新和自动标记已读
   */
  private async handleUnreadAndReadStatus(conversationId: string) {
    const conversationStore = useConversationStore()

    // 更新未读数
    conversationStore.updateTrayUnreadItems()
    const messageViewStore = useMessageViewStore()
    if (messageViewStore.currentChatId === conversationId) {
      await conversationStore.markConversationAsRead(conversationId)
      logger.info({
        text: `当前会话收到新消息，已自动标记已读: conversation=${conversationId}`,
      })
    }
  }

  /**
   * 处理消息表更新通知
   */
  async processMessageUpdate(data: any) {
    const { conversationId, seq, message, messageId, sendStatus } = data

    logger.info({
      text: '收到消息表更新通知',
      data: { conversationId, seq, messageId, sendStatus },
    })

    try {
      const messageStore = useMessageStore()

      // 情况1：主进程直接推过来完整的消息对象 (新消息发送或实时接收)
      if (message) {
        messageStore.addMessage(conversationId, message)
      }
      // 情况2：仅状态变更 (如超时失败、ACK 成功)
      else if (messageId && sendStatus !== undefined) {
        messageStore.addMessage(conversationId, { messageId, sendStatus } as any)
      }
      // 情况3：仅有 seq，说明需要从本地库同步 (通常是后台拉取后的增量同步)
      else if (seq !== undefined) {
        await messageStore.fetchMessagesBySeqRange(conversationId, seq, seq)
      }

      // 后续处理 (未读数等)
      setTimeout(async () => {
        await this.handleUnreadAndReadStatus(conversationId)
      }, 50)
    }
    catch (error) {
      logger.error({
        text: '处理消息表更新失败',
        data: { conversationId, error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseChatMessageEventManager()
