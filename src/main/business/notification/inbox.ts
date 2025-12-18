import type { QueueItem } from '../base/base'
import { NotificationModule, NotificationNotificationCommand } from 'commonModule/type/preload/notification'
import { getNotificationInboxByIdsApi } from 'mainModule/api/notification'
import dBServiceNotificationInbox from 'mainModule/database/services/notification/inbox'
import dBServiceNotificationReadCursor  from 'mainModule/database/services/notification/read-cursor'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('notification-inbox-business')

/**
 * 通知收件箱同步队列项
 */
interface NotificationInboxSyncItem extends QueueItem {
  userId: string
  eventIds: string[]
}

/**
 * 通知收件箱业务逻辑
 * 对应 notification_inboxes 表
 * 负责通知收件箱的数据同步和业务处理
 */
class NotificationInboxBusiness extends BaseBusiness<NotificationInboxSyncItem> {
  protected readonly businessName = 'NotificationInboxBusiness'

  constructor() {
    super({
      queueSizeLimit: 50, // 通知同步请求较多
      delayMs: 500, // 500ms 延迟批量处理
    })
  }


  /**
   * 批量处理通知收件箱同步请求
   */
  protected async processBatchRequests(items: NotificationInboxSyncItem[]): Promise<void> {
    // 按userId聚合eventIds
    const userMap = new Map<string, string[]>()

    for (const item of items) {
      const existing = userMap.get(item.userId)
      if (existing) {
        existing.push(...item.eventIds)
      } else {
        userMap.set(item.userId, [...item.eventIds])
      }
    }

    // 为每个用户批量同步
    for (const [userId, eventIds] of userMap.entries()) {
      const uniqueEventIds = [...new Set(eventIds)]

      if (uniqueEventIds.length === 0) {
        continue
      }

      try {
        logger.info({ text: `开始批量同步通知收件箱: userId=${userId}, eventIds=${uniqueEventIds.join(',')}` })

        // 直接通过ID获取通知收件箱数据（WS推送已给出具体ID）
        const response = await getNotificationInboxByIdsApi({
          eventIds: uniqueEventIds,
        })

        if (response.result?.inbox && response.result.inbox.length > 0) {
          // 更新本地数据库，转换数据类型
          const inboxRows = response.result.inbox.map(inbox => ({
            userId,
            eventId: inbox.eventId,
            eventType: inbox.eventType,
            category: inbox.category,
            version: inbox.version,
            isRead: inbox.isRead ? 1 : 0,
            readAt: inbox.readAt,
            status: inbox.status,
            silent: inbox.silent ? 1 : 0,
            createdAt: inbox.createdAt,
            updatedAt: inbox.updatedAt,
          }))

          await dBServiceNotificationInbox.batchUpsert(inboxRows)

          logger.info({ text: `通知收件箱数据同步成功: userId=${userId}, count=${response.result.inbox.length}` })

          // 发送通知到render进程，告知通知数据已更新
          sendMainNotification('*', NotificationModule.DATABASE_NOTIFICATION, NotificationNotificationCommand.INBOX_UPDATE, {
            source: 'business', // 标识来源：业务层同步
            eventIds: uniqueEventIds,
            updatedCount: response.result.inbox.length,
          })
        } else {
          logger.info({ text: '通知收件箱数据同步完成: noUpdates=true' })
        }
      }
      catch (error) {
        logger.error({ text: '批量同步通知收件箱失败', data: { userId, error: (error as any)?.message } })
      }
    }
  }

  /**
   * 获取用户的未读通知汇总（结合游标时间过滤）
   */
  async getUnreadSummary(userId: string, categories?: string[]) {
    try {
      if (!userId)
        return { total: 0, byCat: [] }

      const hasCategories = !!categories && categories.length > 0
      const filterCategories = hasCategories ? categories : ['social', 'group', 'system']

      // 为每个分类计算真正的未读数：createdAt > lastReadAt 且 isRead = 0
      const byCatPromises = filterCategories.map(async (category) => {
        // 获取该分类的游标时间
        const cursor = await dBServiceNotificationReadCursor.getCursor({ userId, category })
        const lastReadAt = cursor?.lastReadAt || 0

        // 计算该分类的未读数
        const unreadCount = await dBServiceNotificationInbox.getUnreadCountAfterTime({ userId, category, afterTime: lastReadAt })

        return {
          category,
          unread: unreadCount,
        }
      })

      const byCat = await Promise.all(byCatPromises)
      const total = byCat.reduce((acc: number, cur: { category: string, unread: number }) => acc + cur.unread, 0)

      return { total, byCat }
    }
    catch (error) {
      logger.error({ text: '获取未读汇总失败', data: { error: (error as any)?.message } })
      return { total: 0, byCat: [] }
    }
  }

  /**
   * 标记指定事件为已读
   */
  async markEventRead(userId: string, eventIds: string[]) {
    try {
      await dBServiceNotificationInbox.markReadByEventIds({ userId, eventIds })

      logger.info({ text: `标记事件已读成功: count=${eventIds.length}` })

      // 发送通知到render进程
      sendMainNotification('*', NotificationModule.DATABASE_NOTIFICATION, NotificationNotificationCommand.INBOX_UPDATE, {
        source: 'mark_read',
        eventIds,
      })

      return true
    }
    catch (error) {
      logger.error({ text: '标记事件已读失败', data: { error: (error as any)?.message } })
      return false
    }
  }

  /**
   * 批量获取通知收件箱详情
   */
  async getByEventIds(userId: string, eventIds: string[]) {
    try {
      return await dBServiceNotificationInbox.getByEventIds({ userId, eventIds })
    }
    catch (error) {
      logger.error({ text: '获取通知收件箱详情失败', data: { error: (error as any)?.message } })
      return []
    }
  }

  /**
   * 处理通知收件箱表的更新通知
   * 将同步请求加入队列，批量处理
   */
  async handleTableUpdates(version: number, eventId: string, userId: string) {
    this.addToQueue({
      key: `inbox_${userId}_${version}`,
      data: { eventId, version },
      timestamp: Date.now(),
      userId,
      eventIds: [eventId],
    })
  }
}

// 导出单例实例
export default new NotificationInboxBusiness()
