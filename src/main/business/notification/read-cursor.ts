import type { IDBNotificationReadCursor } from 'commonModule/type/database/notification'
import { NotificationReadCursorService } from 'mainModule/database/services/notification/read-cursor'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('notification-read-cursor-business')

/**
 * 通知已读游标业务逻辑
 * 对应 notification_reads 表
 * 负责已读游标的管理和业务处理
 */
export class NotificationReadCursorBusiness {
  protected readonly businessName = 'NotificationReadCursorBusiness'

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
}

// 导出单例实例
export const notificationReadCursorBusiness = new NotificationReadCursorBusiness()
