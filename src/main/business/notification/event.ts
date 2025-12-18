import type { QueueItem } from '../base/base'
import dBServiceNotificationEvent  from 'mainModule/database/services/notification/event'
import { getNotificationEventsByIdsApi } from 'mainModule/api/notification'
import { BaseBusiness } from '../base/base'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('notification-event-business')

/**
 * 通知事件同步队列项
 */
interface NotificationEventSyncItem extends QueueItem {
  eventIds: string[]
}

/**
 * 通知事件业务逻辑
 * 对应 notification_events 表
 * 负责通知事件的业务处理
 */
class NotificationEventBusiness extends BaseBusiness<NotificationEventSyncItem> {
  protected readonly businessName = 'NotificationEventBusiness'

  constructor() {
    super({
      queueSizeLimit: 50, // 通知事件同步请求较多
      delayMs: 500, // 500ms 延迟批量处理
    })
  }

  /**
   * 根据事件ID获取通知事件详情
   */
  async getByIds(eventIds: string[]) {
    try {
      return await dBServiceNotificationEvent.getByIds({ eventIds })
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
      const events = await dBServiceNotificationEvent.getByIds([eventId])
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
      await dBServiceNotificationEvent.batchUpsert(events)
      logger.info({ text: `批量更新通知事件成功: count=${events.length}` })
      return true
    }
    catch (error) {
      logger.error({ text: '批量更新通知事件失败', data: { error: (error as any)?.message } })
      return false
    }
  }

  /**
   * 处理通知事件表的更新通知
   * 将同步请求加入队列，批量处理
   */
  async handleTableUpdates(eventId: string) {
    this.addToQueue({
      key: `event_${eventId}`,
      data: { eventId },
      timestamp: Date.now(),
      eventIds: [eventId], // 事件ID列表
    })
  }

  /**
   * 批量处理通知事件同步请求
   */
  protected async processBatchRequests(items: NotificationEventSyncItem[]): Promise<void> {
    // 聚合所有事件ID
    const allEventIds = [...new Set(items.flatMap(item => item.eventIds))]

    if (allEventIds.length === 0) {
      logger.info({ text: '通知事件同步完成: noValidEventIds=true' })
      return
    }

    try {
      logger.info({ text: `开始批量同步通知事件: eventIds=${allEventIds.join(',')}` })

      // 直接通过ID获取通知事件数据（WS推送已给出具体ID）
      const response = await getNotificationEventsByIdsApi({
        eventIds: allEventIds,
      })

      if (response.result?.events && response.result.events.length > 0) {
        // 更新本地数据库
        await this.batchUpsert(response.result.events)
        logger.info({ text: `通知事件批量同步成功: count=${response.result.events.length}` })
      } else {
        logger.info({ text: '通知事件批量同步完成: noUpdates=true' })
      }
    }
    catch (error) {
      logger.error({ text: '批量同步通知事件失败', data: { error: (error as any)?.message } })
    }
  }
}

// 导出单例实例
export default new NotificationEventBusiness()
