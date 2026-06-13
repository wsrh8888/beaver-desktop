import Logger from 'renderModule/utils/logger'
import { useMessageMediaStore } from '../../pinia/message/message-media'

const logger = new Logger('DatabaseChatMessageMediaEventManager')

class DatabaseChatMessageMediaEventManager {
  async processMessageMediaUpdate(data: any) {
    const { messageIds } = data

    logger.info({
      text: '收到消息媒体状态表更新通知',
      data,
    })

    try {
      const messageMediaStore = useMessageMediaStore()
      messageMediaStore.merge(messageIds || [])
    }
    catch (error) {
      logger.error({
        text: '处理消息媒体状态表更新失败',
        data: { messageIds, error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseChatMessageMediaEventManager()
