import Logger from 'renderModule/utils/logger'
import { useConversationStore } from '../../pinia/conversation/conversation'

const logger = new Logger('DatabaseChatUserConversationEventManager')

class DatabaseChatUserConversationEventManager {
  /**
   * 处理用户会话设置表更新通知
   */
  async processUserConversationUpdate(data: any) {
    const { conversationIds } = data

    logger.info({
      text: `收到用户会话设置表更新通知`,
      data,
    })

    try {
      const conversationStore = useConversationStore()

      // 根据会话ID批量更新会话信息
      await conversationStore.batchUpdateConversationsByIds(conversationIds || [])

      logger.info({
        text: `用户会话设置表更新处理完成，更新了 ${conversationIds?.length || 0} 个会话`,
        data: { conversationIds },
      })
    }
    catch (error) {
      logger.error({
        text: '处理用户会话设置表更新失败',
        data: { conversationIds, error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseChatUserConversationEventManager()
