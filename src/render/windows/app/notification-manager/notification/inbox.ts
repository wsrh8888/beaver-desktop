import Logger from 'renderModule/utils/logger'
import { useNotificationStore } from '../../pinia/notification/notification'

const logger = new Logger('DatabaseNotificationInboxEventManager')

class DatabaseNotificationInboxEventManager {
  /**
   * 处理通知收件箱更新通知
   */
  async processInboxUpdate(data: any) {
    const { source, eventIds, updatedCount } = data

    logger.info({
      text: '收到通知收件箱更新通知',
      data: { source, eventIds, updatedCount },
    })

    try {
      // 通知收件箱更新表示有新通知或状态变化
      const notificationStore = useNotificationStore()

      // 根据来源处理不同的更新逻辑
      if (source === 'business' || source === 'sync_version') {
        // 业务层同步或版本同步，刷新通知数据
        await notificationStore.refreshInbox()
      } else if (source === 'mark_read') {
        // 标记已读，更新本地状态
        await notificationStore.markEventsRead(eventIds)
      }

      logger.info({
        text: `成功处理通知收件箱更新: source=${source}, count=${updatedCount}`,
      })
    }
    catch (error) {
      logger.error({
        text: '处理通知收件箱更新失败',
        data: { error: (error as any)?.message },
      })
    }
  }
}

export default new DatabaseNotificationInboxEventManager()
