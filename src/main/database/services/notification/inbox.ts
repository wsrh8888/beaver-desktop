import type { IDBNotificationInbox } from 'commonModule/type/database/notification'
import { and, eq, gt, inArray, sql } from 'drizzle-orm'
import { notificationInboxes } from 'mainModule/database/tables/notification/inbox'
import dbManager from '../../db'

// 通知收件箱服务
export class NotificationInboxService {
  static get db() {
    return dbManager.db
  }

  // 批量插入或更新收件箱记录（userId + eventId 唯一）
  static async batchUpsert(inboxes: IDBNotificationInbox[]): Promise<void> {
    if (!inboxes.length)
      return

    await this.db.insert(notificationInboxes)
      .values(inboxes)
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
  static async markReadByEventIds(userId: string, eventIds: string[], readAt?: number): Promise<void> {
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
  static async getInboxesAfterVersion(userId: string, version: number, limit = 100): Promise<IDBNotificationInbox[]> {
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
  static async getVersionMapByEventIds(userId: string, eventIds: string[]): Promise<Map<string, number>> {
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
  static async getByEventIds(userId: string, eventIds: string[]): Promise<IDBNotificationInbox[]> {
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

  // 统计未读汇总（总数 + 按分类）
  static async getUnreadSummary(userId: string, categories?: string[]) {
    if (!userId)
      return { total: 0, byCat: [] as Array<{ category: string, unread: number }> }

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

    const byCat = rows.map((row: { category: string, unread: number }) => ({
      category: row.category,
      unread: Number(row.unread) || 0,
    }))
    const total = byCat.reduce((acc: number, cur: { category: string, unread: number }) => acc + cur.unread, 0)

    return { total, byCat }
  }
}
