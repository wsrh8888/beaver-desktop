import Logger from 'renderModule/utils/logger'
import { useConversationStore } from '../../pinia/conversation/conversation'

const logger = new Logger('DatabaseChatConversationEventManager')

class DatabaseChatConversationEventManager {
  /**
   * 处理会话表更新通知
   */
  async processConversationUpdate(data: any) {
    const { conversationIds, updates, timestamp } = data

    logger.info({
      text: `收到会话表更新通知，${conversationIds?.length || 0} 个会话`,
      data: { conversationIds, updates, timestamp },
    })

    try {
      const conversationStore = useConversationStore()

      // 暂时只重新获取会话信息，后续可以实现局部更新
      for (const conversationId of conversationIds || []) {
        await conversationStore.initConversationById(conversationId)
      }

      logger.info({
        text: `成功更新 ${conversationIds?.length || 0} 个会话`,
        data: { conversationIds },
      })
    }
    catch (error) {
      logger.error({
        text: '处理会话表更新失败',
        data: { conversationIds, error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseChatConversationEventManager()
