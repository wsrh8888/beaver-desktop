import Logger from 'renderModule/utils/logger'
import { useEmojiStore } from '../../pinia/emoji/emoji'

const logger = new Logger('DatabaseEmojiEventManager')

class DatabaseEmojiEventManager {
  /**
   * 处理表情基础表更新通知
   */
  async processEmojiUpdate(data: any) {
    logger.info({
      text: '收到表情基础表更新通知',
      data,
    })

    try {
      const emojiStore = useEmojiStore()

      // 处理推送的数据格式
      if (data?.updatedEmojis && Array.isArray(data.updatedEmojis)) {
        // 这里可以根据更新的表情ID来重新加载表情包数据
        // 或者触发表情数据的重新获取
        logger.info({
          text: `表情基础表更新，${data.updatedEmojis.length} 个表情数据已更新`,
          data: { updatedEmojis: data.updatedEmojis },
        })

        // 通知表情store进行相应处理
        emojiStore.handleEmojiUpdate(data)
      }
      else {
        console.warn('表情信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理表情基础表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseEmojiEventManager()
