import Logger from 'renderModule/utils/logger'
import { useFriendVerifyStore } from '../../pinia/friend/friend_verify'

const logger = new Logger('DatabaseFriendVerifyEventManager')

class DatabaseFriendVerifyEventManager {
  /**
   * 处理好友验证表更新通知
   */
  async processFriendVerifyUpdate(data: any) {
    logger.info({
      text: '收到好友验证表更新通知',
      data,
    })

    try {
      const friendVerifyStore = useFriendVerifyStore()

      // 处理推送的数据格式
      if (data?.updatedVerifies && Array.isArray(data.updatedVerifies)) {
        // 使用用户ID列表更新好友验证数据
        const fetchedVerifies = await friendVerifyStore.updateVerifiesByUserIds(data.updatedVerifies)

        logger.info({
          text: `好友验证表更新处理完成，根据用户ID列表更新了 ${fetchedVerifies?.length || 0} 个验证记录`,
          data: { updatedVerifies: data.updatedVerifies, fetchedVerifies },
        })
      } else {
        console.warn('好友验证信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理好友验证表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseFriendVerifyEventManager()
