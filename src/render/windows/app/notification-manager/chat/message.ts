import Logger from 'renderModule/utils/logger'
import { useMessageStore } from '../../pinia/message/message'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'

const logger = new Logger('DatabaseChatMessageEventManager')

class DatabaseChatMessageEventManager {
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
      logger.info({
        text: `成功处理消息更新: conversation=${conversationId}, seq=${seq}`,
      })
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
