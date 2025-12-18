import type { IDBNotificationInbox } from 'commonModule/type/database/db/notification'
import { and, eq, gt, inArray, sql } from 'drizzle-orm'
import { BaseService } from '../base'
import { notificationInboxes } from 'mainModule/database/tables/notification/inbox'
import type {
  DBBatchAddToInboxReq,
  DBGetUserInboxReq,
  DBGetUserInboxRes,
  DBMarkAsReadReq,
  DBDeleteInboxItemReq,
} from 'commonModule/type/database/server/notification/inbox'

// 通知收件箱服务
class NotificationInboxService extends BaseService {

  /**
   * @description 批量添加通知到收件箱
   */
  async batchAdd(req: DBBatchAddToInboxReq): Promise<void> {
    if (!req.inboxes.length)
      return

    await this.db.insert(notificationInboxes)
      .values(req.inboxes)
      .onConflictDoUpdate({
        target: [notificationInboxes.userId, notificationInboxes.eventId],
        set: {
          eventType: sql.raw(`excluded.event_type`),
          category: sql.raw(`excluded.category`),
          version: sql.raw(`excluded.version`),
          isRead: sql.raw(`excluded.is_read`),
          readAt: sql.raw(`excluded.read_at`),
          status: sql.raw(`excluded.status`),
          silent: sql.raw(`excluded.silent`),
          updatedAt: sql.raw(`excluded.updated_at`),
        },
      })
      .run()
  }

  // 标记指定事件为已读
   async markReadByEventIds(userId: string, eventIds: string[], readAt?: number): Promise<void> {
    if (!eventIds.length)
      return

    const readTime = readAt ?? Math.floor(Date.now() / 1000)
    await this.db.update(notificationInboxes)
      .set({
        isRead: 1,
        readAt: readTime,
        updatedAt: readTime,
      })
      .where(
        and(
          eq(notificationInboxes.userId as any, userId as any),
          inArray(notificationInboxes.eventId as any, eventIds as any),
        ),
      )
      .run()
  }

  // 按版本增量拉取用户收件箱
   async getInboxesAfterVersion(userId: string, version: number, limit = 100): Promise<IDBNotificationInbox[]> {
    return await this.db.select()
      .from(notificationInboxes)
      .where(
        and(
          eq(notificationInboxes.userId as any, userId as any),
          gt(notificationInboxes.version as any, version as any),
        ),
      )
      .orderBy(notificationInboxes.version)
      .limit(limit)
      .all()
  }

  // 获取指定事件ID的收件箱本地版本映射
   async getVersionMapByEventIds(userId: string, eventIds: string[]): Promise<Map<string, number>> {
    if (!userId || !eventIds.length)
      return new Map()

    const rows = await this.db.select({
      eventId: notificationInboxes.eventId,
      version: notificationInboxes.version,
    })
      .from(notificationInboxes)
      .where(
        and(
          eq(notificationInboxes.userId as any, userId as any),
          inArray(notificationInboxes.eventId as any, eventIds as any),
        ),
      )
      .all()

    const map = new Map<string, number>()
    rows.forEach((row: { eventId: string, version?: number }) => {
      map.set(row.eventId, row.version || 0)
    })
    return map
  }

  // 根据事件ID列表获取收件箱记录
   async getByEventIds(userId: string, eventIds: string[]): Promise<IDBNotificationInbox[]> {
    if (!userId || !eventIds.length)
      return []

    return await this.db.select()
      .from(notificationInboxes)
      .where(
        and(
          eq(notificationInboxes.userId as any, userId as any),
          inArray(notificationInboxes.eventId as any, eventIds as any),
        ),
      )
      .all()
  }

  // 获取指定用户和分类的基础未读统计（不考虑游标时间）
   async getBasicUnreadByCategories(userId: string, categories?: string[]) {
    if (!userId)
      return [] as Array<{ category: string, unread: number }>

    const hasCategories = !!categories && categories.length > 0

    const rows = await this.db.select({
      category: notificationInboxes.category,
      unread: sql<number>`sum(case when is_read = 0 then 1 else 0 end)`,
    })
      .from(notificationInboxes)
      .where(
        hasCategories
          ? and(
              eq(notificationInboxes.userId as any, userId as any),
              inArray(notificationInboxes.category as any, categories as any),
            )
          : eq(notificationInboxes.userId as any, userId as any),
      )
      .groupBy(notificationInboxes.category)
      .all()

    return rows.map((row: { category: string, unread: number }) => ({
      category: row.category,
      unread: Number(row.unread) || 0,
    }))
  }

  // 获取用户指定分类的通知列表（基础查询）
   async getByUserIdAndCategories(userId: string, categories?: string[], limit = 100) {
    if (!userId) return []

    const hasCategories = !!categories && categories.length > 0

    return await this.db.select()
      .from(notificationInboxes)
      .where(
        hasCategories
          ? and(
              eq(notificationInboxes.userId as any, userId as any),
              inArray(notificationInboxes.category as any, categories as any),
            )
          : eq(notificationInboxes.userId as any, userId as any),
      )
      .orderBy(notificationInboxes.createdAt)
      .limit(limit)
      .all()
  }

  // 获取指定时间之后指定分类的未读数量
   async getUnreadCountAfterTime(userId: string, category: string, afterTime: number) {
    return await this.db.$count(notificationInboxes, and(
      eq(notificationInboxes.userId as any, userId as any),
      eq(notificationInboxes.category as any, category as any),
      gt(notificationInboxes.createdAt as any, afterTime),
      eq(notificationInboxes.isRead as any, 0),
    ))
  }
}
