import type { IDBNotificationReadCursor } from 'commonModule/type/database/notification'
import type { QueueItem } from '../base/base'
import { NotificationReadCursorService } from 'mainModule/database/services/notification/read-cursor'
import { getNotificationReadCursorsApi } from 'mainModule/api/notification'
import { BaseBusiness } from '../base/base'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('notification-read-cursor-business')

/**
 * 通知已读游标同步队列项
 */
interface NotificationReadCursorSyncItem extends QueueItem {
  userId: string
  category: string
}

/**
 * 通知已读游标业务逻辑
 * 对应 notification_reads 表
 * 负责已读游标的管理和业务处理
 */
export class NotificationReadCursorBusiness extends BaseBusiness<NotificationReadCursorSyncItem> {
  protected readonly businessName = 'NotificationReadCursorBusiness'

  constructor() {
    super({
      queueSizeLimit: 20, // 已读游标同步请求较少
      delayMs: 1000, // 1秒延迟批量处理
    })
  }

  /**
   * 获取用户的已读游标
   */
  async getCursors(userId: string, categories?: string[]) {
    try {
      return await NotificationReadCursorService.getCursors(userId, categories)
    }
    catch (error) {
      logger.error({ text: '获取已读游标失败', data: { error: (error as any)?.message } })
      return []
    }
  }

  /**
   * 获取单个分类的游标
   */
  async getCursor(userId: string, category: string) {
    try {
      return await NotificationReadCursorService.getCursor(userId, category)
    }
    catch (error) {
      logger.error({ text: '获取单个游标失败', data: { error: (error as any)?.message } })
      return undefined
    }
  }

  /**
   * 更新游标
   */
  async upsertCursor(cursor: IDBNotificationReadCursor) {
    try {
      await NotificationReadCursorService.upsertCursor(cursor)
      logger.info({ text: '更新游标成功', data: { userId: cursor.userId, category: cursor.category } })
      return true
    }
    catch (error) {
      logger.error({ text: '更新游标失败', data: { error: (error as any)?.message } })
      return false
    }
  }

  /**
   * 批量更新游标
   */
  async batchUpsertCursors(cursors: IDBNotificationReadCursor[]) {
    try {
      for (const cursor of cursors) {
        await NotificationReadCursorService.upsertCursor(cursor)
      }
      logger.info({ text: `批量更新游标成功: count=${cursors.length}` })
      return true
    }
    catch (error) {
      logger.error({ text: '批量更新游标失败', data: { error: (error as any)?.message } })
      return false
    }
  }

  /**
   * 处理通知已读游标表的更新通知
   * 将同步请求加入队列，批量处理
   */
  async handleTableUpdates(version: number, userId: string, category?: string) {
    this.addToQueue({
      key: `cursor_${userId}_${version}`,
      data: { userId, version },
      timestamp: Date.now(),
      userId,
      category: category || '', // 分类，批量处理时处理所有分类
    })
  }

  /**
   * 批量处理通知已读游标同步请求
   */
  protected async processBatchRequests(items: NotificationReadCursorSyncItem[]): Promise<void> {
    // 按userId聚合
    const userIds = [...new Set(items.map(item => item.userId))]

    // 为每个用户同步游标数据
    for (const userId of userIds) {
      try {
        logger.info({ text: `开始同步通知已读游标: userId=${userId}` })

        // 获取用户的完整游标数据（WS推送触发同步）
        const response = await getNotificationReadCursorsApi({
          categories: [], // 获取所有分类的游标
        })

        if (response.result?.cursors && response.result.cursors.length > 0) {
          // 转换为本地数据库格式
          const cursorRows = response.result.cursors.map(cursor => ({
            userId,
            category: cursor.category,
            lastReadAt: cursor.lastReadAt,
            version: cursor.version,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }))

          // 更新本地数据库
          await this.batchUpsertCursors(cursorRows)
          logger.info({ text: `通知已读游标同步成功: userId=${userId}, count=${response.result.cursors.length}` })
        } else {
          logger.info({ text: '通知已读游标同步完成: noUpdates=true' })
        }
      }
      catch (error) {
        logger.error({ text: '同步通知已读游标失败', data: { userId, error: (error as any)?.message } })
      }
    }
  }
}

// 导出单例实例
export const notificationReadCursorBusiness = new NotificationReadCursorBusiness()
