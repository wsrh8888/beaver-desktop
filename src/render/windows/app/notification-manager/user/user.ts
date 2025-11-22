import Logger from 'renderModule/utils/logger'
import { useContactStore } from '../../pinia/contact/contact'

const logger = new Logger('DatabaseUserEventManager')

class DatabaseUserEventManager {
  /**
   * 处理用户表更新通知
   */
  async processUserUpdate(data: any) {
    logger.info({
      text: '收到用户表更新通知',
      data,
    })

    try {
      const contactStore = useContactStore()

      // 处理推送的数据格式
      if (data?.updatedUsers && Array.isArray(data.updatedUsers)) {
        // 提取用户ID列表
        const userIds = data.updatedUsers.map((user: any) => user.userId)

        // 调用contact store的方法来批量更新用户信息
        const fetchedUsers = await contactStore.updateContactsByIds(userIds)

        logger.info({
          text: `用户信息更新成功: count=${fetchedUsers?.length || 0}, source=${data.source || 'unknown'}`,
          data: { updatedUsers: data.updatedUsers, fetchedUsers },
        })
      }
      else {
        console.warn('用户信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理用户信息更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseUserEventManager()
