import { NotificationEventService } from 'mainModule/database/services/notification/event'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('notification-event-business')

/**
 * 通知事件业务逻辑
 * 对应 notification_events 表
 * 负责通知事件的业务处理
 */
export class NotificationEventBusiness {
  protected readonly businessName = 'NotificationEventBusiness'

  /**
   * 根据事件ID获取通知事件详情
   */
  async getByIds(eventIds: string[]) {
    try {
      return await NotificationEventService.getByIds(eventIds)
    }
    catch (error) {
      logger.error({ text: '获取通知事件详情失败', data: { error: (error as any)?.message } })
      return []
    }
  }

  /**
   * 根据事件ID获取单个通知事件
   */
  async getById(eventId: string) {
    try {
      const events = await NotificationEventService.getByIds([eventId])
      return events.length > 0 ? events[0] : null
    }
    catch (error) {
      logger.error({ text: '获取单个通知事件失败', data: { error: (error as any)?.message } })
      return null
    }
  }

  /**
   * 批量插入或更新通知事件
   */
  async batchUpsert(events: any[]) {
    try {
      await NotificationEventService.batchUpsert(events)
      logger.info({ text: `批量更新通知事件成功: count=${events.length}` })
      return true
    }
    catch (error) {
      logger.error({ text: '批量更新通知事件失败', data: { error: (error as any)?.message } })
      return false
    }
  }
}

// 导出单例实例
export const notificationEventBusiness = new NotificationEventBusiness()
