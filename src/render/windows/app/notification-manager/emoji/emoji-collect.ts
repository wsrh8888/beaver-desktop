import Logger from 'renderModule/utils/logger'
import { useEmojiStore } from '../../pinia/emoji/emoji'

const logger = new Logger('DatabaseEmojiCollectEventManager')

class DatabaseEmojiCollectEventManager {
  /**
   * 处理表情收藏表更新通知
   */
  async processEmojiCollectUpdate(data: any) {
    logger.info({
      text: '收到表情收藏表更新通知',
      data,
    })

    try {
      const emojiStore = useEmojiStore()

      // 处理推送的数据格式
      if (data?.updatedCollects && Array.isArray(data.updatedCollects)) {
        // 重新加载用户收藏的表情列表
        await emojiStore.init()

        logger.info({
          text: `表情收藏表更新处理完成，重新加载了用户收藏的表情列表`,
          data: { updatedCollects: data.updatedCollects },
        })
      }
      else {
        console.warn('表情收藏信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理表情收藏表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseEmojiCollectEventManager()
