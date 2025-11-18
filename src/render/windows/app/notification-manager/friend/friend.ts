import Logger from 'renderModule/utils/logger'
import { useFriendStore } from '../../pinia/friend/friend'

const logger = new Logger('DatabaseFriendEventManager')

class DatabaseFriendEventManager {
  /**
   * 处理好友表更新通知
   */
  async processFriendUpdate(data: any) {
    logger.info({
      text: '收到好友表更新通知',
      data,
    })

    try {
      // 处理推送的数据格式
      if (data?.updatedFriends && Array.isArray(data.updatedFriends)) {
        // 使用用户ID列表更新好友数据
        const friendStore = useFriendStore()

        const fetchedFriends = await friendStore.updateFriendsByUserIds(data.updatedFriends)

        logger.info({
          text: `好友表更新处理完成，根据用户ID列表更新了 ${fetchedFriends?.length || 0} 个好友`,
          data: { updatedFriends: data.updatedFriends, fetchedFriends },
        })
      } else {
        console.warn('好友信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理好友表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseFriendEventManager()
