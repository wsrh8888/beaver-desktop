import Logger from 'renderModule/utils/logger'
import { useConversationStore } from '../../pinia/conversation/conversation'

const logger = new Logger('DatabaseChatUserConversationEventManager')

class DatabaseChatUserConversationEventManager {
  /**
   * 处理用户会话设置表更新通知
   */
  async processUserConversationUpdate(data: any) {
    const { updatedUsers } = data

    logger.info({
      text: `收到用户会话设置表更新通知，${updatedUsers?.length || 0} 个用户`,
      data: { updatedUsers },
    })

    try {
      // 用户会话设置更新 - 重新加载会话列表以获取最新设置
      const conversationStore = useConversationStore()

      // 重新加载会话列表，获取最新的会话设置
      await conversationStore.loadMoreConversations()

      logger.info({
        text: `用户会话设置表更新处理完成，重新加载了会话列表`,
        data: { updatedUsers },
      })
    }
    catch (error) {
      logger.error({
        text: '处理用户会话设置表更新失败',
        data: { updatedUsers, error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseChatUserConversationEventManager()
