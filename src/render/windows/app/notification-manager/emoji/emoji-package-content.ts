import Logger from 'renderModule/utils/logger'
import { useEmojiStore } from '../../pinia/emoji/emoji'

const logger = new Logger('DatabaseEmojiPackageContentEventManager')

class DatabaseEmojiPackageContentEventManager {
  /**
   * 处理表情包内容表更新通知
   */
  async processEmojiPackageContentUpdate(data: any) {
    logger.info({
      text: '收到表情包内容表更新通知',
      data,
    })

    try {
      const emojiStore = useEmojiStore()

      // 处理推送的数据格式
      if (data?.updatedPackageContents && Array.isArray(data.updatedPackageContents)) {
        // 这里可以根据更新的表情包ID来重新加载表情包内容
        // 或者触发表情包内容的重新获取
        logger.info({
          text: `表情包内容表更新，${data.updatedPackageContents.length} 个表情包内容已更新`,
          data: { updatedPackageContents: data.updatedPackageContents },
        })

        // 可以根据具体需求来重新加载相关表情包的内容
        // emojiStore.handleEmojiPackageContentUpdate(data)
      }
      else {
        console.warn('表情包内容信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理表情包内容表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseEmojiPackageContentEventManager()
