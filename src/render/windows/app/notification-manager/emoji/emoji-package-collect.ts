import Logger from 'renderModule/utils/logger'
import { useEmojiStore } from '../../pinia/emoji/emoji'

const logger = new Logger('DatabaseEmojiPackageCollectEventManager')

class DatabaseEmojiPackageCollectEventManager {
  /**
   * 处理表情包收藏表更新通知
   */
  async processEmojiPackageCollectUpdate(data: any) {
    logger.info({
      text: '收到表情包收藏表更新通知',
      data,
    })

    try {
      const emojiStore = useEmojiStore()

      // 处理推送的数据格式
      if (data?.updatedPackageCollects && Array.isArray(data.updatedPackageCollects)) {
        // 重新加载表情包收藏列表
        await emojiStore.init()

        logger.info({
          text: `表情包收藏表更新处理完成，重新加载了表情包收藏列表`,
          data: { updatedPackageCollects: data.updatedPackageCollects },
        })
      }
      else {
        console.warn('表情包收藏信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理表情包收藏表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseEmojiPackageCollectEventManager()
