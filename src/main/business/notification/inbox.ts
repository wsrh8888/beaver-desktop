import type { IDBNotificationInbox } from 'commonModule/type/database/notification'
import type { QueueItem } from '../base/base'
import { NotificationModule, NotificationNotificationCommand } from 'commonModule/type/preload/notification'
import { getNotificationInboxByIdsApi } from 'mainModule/api/notification'
import { NotificationInboxService } from 'mainModule/database/services/notification/inbox'
import { NotificationReadCursorService } from 'mainModule/database/services/notification/read-cursor'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('notification-inbox-business')

/**
 * 通知收件箱同步队列项
 */
interface NotificationInboxSyncItem extends QueueItem {
  eventIds: string[]
  userId: string
}

/**
 * 通知收件箱业务逻辑
 * 对应 notification_inboxes 表
 * 负责通知收件箱的数据同步和业务处理
 */
export class NotificationInboxBusiness extends BaseBusiness<NotificationInboxSyncItem> {
  protected readonly businessName = 'NotificationInboxBusiness'

  constructor() {
    super({
      queueSizeLimit: 50, // 通知同步请求较多
      delayMs: 500, // 500ms 延迟批量处理
    })
  }

  /**
   * 处理通知收件箱更新通知
   * 将同步请求加入队列，批量处理
   */
  async handleInboxUpdates(userId: string, eventIds: string[]) {
    if (!eventIds.length) return

    this.addToQueue({
      key: `inbox_${userId}_${eventIds[0]}`, // 使用第一个eventId作为key标识
      data: { userId, eventIds },
      timestamp: Date.now(),
      userId,
      eventIds,
    })
  }

  /**
   * 批量处理通知收件箱同步请求
   */
  protected async processBatchRequests(items: NotificationInboxSyncItem[]): Promise<void> {
    // 合并所有eventIds
    const allEventIds = [...new Set(items.flatMap(item => item.eventIds))]
    const userId = items[0]?.userId

    if (!allEventIds.length || !userId) {
      logger.info({ text: '通知收件箱同步完成: noValidEventIds=true' })
      return
    }

    try {
      logger.info({ text: `开始批量同步通知收件箱: count=${allEventIds.length}` })

      const response = await getNotificationInboxByIdsApi({
        eventIds: allEventIds,
      })

      if (response.result?.inbox && response.result.inbox.length > 0) {
        // 更新本地数据库，转换数据类型
        const inboxRows: IDBNotificationInbox[] = response.result.inbox.map(inbox => ({
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

        await NotificationInboxService.batchUpsert(inboxRows)

        logger.info({ text: `通知收件箱数据同步成功: count=${response.result.inbox.length}` })

        // 发送通知到render进程，告知通知数据已更新
        sendMainNotification('*', NotificationModule.DATABASE_NOTIFICATION, NotificationNotificationCommand.INBOX_UPDATE, {
          source: 'business', // 标识来源：业务层同步
          eventIds: allEventIds,
          updatedCount: response.result.inbox.length,
        })
      }
      else {
        logger.info({ text: '通知收件箱数据同步完成: noUpdates=true' })
      }
    }
    catch (error) {
      logger.error({ text: '同步通知收件箱数据失败', data: { error: (error as any)?.message } })
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
        const cursor = await NotificationReadCursorService.getCursor(userId, category)
        const lastReadAt = cursor?.lastReadAt || 0

        // 计算该分类的未读数
        const unreadCount = await NotificationInboxService.getUnreadCountAfterTime(userId, category, lastReadAt)

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
      await NotificationInboxService.markReadByEventIds(userId, eventIds)

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
      return await NotificationInboxService.getByEventIds(userId, eventIds)
    }
    catch (error) {
      logger.error({ text: '获取通知收件箱详情失败', data: { error: (error as any)?.message } })
      return []
    }
  }
}

// 导出单例实例
export const notificationInboxBusiness = new NotificationInboxBusiness()
