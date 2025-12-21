import Logger from 'renderModule/utils/logger'
import { useEmojiStore } from '../../pinia/emoji/emoji'

const logger = new Logger('DatabaseEmojiPackageEventManager')

class DatabaseEmojiPackageEventManager {
  /**
   * 处理表情包表更新通知
   */
  async processEmojiPackageUpdate(data: any) {
    logger.info({
      text: '收到表情包表更新通知',
      data,
    })

    try {
      const emojiStore = useEmojiStore()

      // 处理推送的数据格式
      if (data?.updatedPackages && Array.isArray(data.updatedPackages)) {
        // 重新加载表情包列表
        await emojiStore.init()

        logger.info({
          text: `表情包表更新处理完成，重新加载了表情包列表`,
          data: { updatedPackages: data.updatedPackages },
        })
      }
      else {
        console.warn('表情包信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理表情包表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseEmojiPackageEventManager()
