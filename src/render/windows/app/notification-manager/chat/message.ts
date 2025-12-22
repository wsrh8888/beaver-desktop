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
    const { conversationId, seq } = data

    logger.info({
      text: '收到消息表更新通知',
      data: { conversationId, seq },
    })

    try {
      // 消息表更新表示有新消息，可以拉取最新消息
      const messageStore = useMessageStore()

      // 根据消息序列号拉取最新消息
      await messageStore.fetchMessagesBySeqRange(conversationId, seq, seq)
      setTimeout(async () => {
        // 处理未读数更新和自动标记已读
        await this.handleUnreadAndReadStatus(conversationId)

        logger.info({
          text: `成功处理消息更新: conversation=${conversationId}, seq=${seq}`,
        })
      }, 100)
    }
    catch (error) {
      logger.error({
        text: '处理消息表更新失败',
        data: { conversationId, seq, error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseChatMessageEventManager()
