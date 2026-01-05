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
  DBMarkReadByEventIdsReq,
  DBGetInboxesAfterVersionReq,
  DBGetInboxesAfterVersionRes,
  DBGetVersionMapByEventIdsReq,
  DBGetVersionMapByEventIdsRes,
  DBGetByEventIdsReq,
  DBGetByEventIdsRes,
  DBGetUnreadCountAfterTimeReq,
  DBGetUnreadCountAfterTimeRes,
  DBGetBasicUnreadByCategoriesReq,
  DBGetBasicUnreadByCategoriesRes,
  DBGetByUserIdAndCategoriesReq,
  DBGetByUserIdAndCategoriesRes,
} from 'commonModule/type/database/server/notification/inbox'

// 通知收件箱服务
class dBServiceNotificationInbox extends BaseService {

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

  /**
   * @description 标记指定事件为已读
   */
  async markReadByEventIds(req: DBMarkReadByEventIdsReq): Promise<void> {
    const { userId, eventIds, readAt } = req
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

  /**
   * @description 按版本增量拉取用户收件箱
   */
  async getInboxesAfterVersion(req: DBGetInboxesAfterVersionReq): Promise<DBGetInboxesAfterVersionRes> {
    const { userId, version, limit = 100 } = req
    const inboxes = await this.db.select()
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
    return { inboxes }
  }

  /**
   * @description 获取指定事件ID的收件箱本地版本映射
   */
  async getVersionMapByEventIds(req: DBGetVersionMapByEventIdsReq): Promise<DBGetVersionMapByEventIdsRes> {
    const { userId, eventIds } = req
    if (!userId || !eventIds.length)
      return { versionMap: new Map() }

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

    const versionMap = new Map<string, number>()
    rows.forEach((row: { eventId: string, version?: number }) => {
      versionMap.set(row.eventId, row.version || 0)
    })
    return versionMap
  }

  /**
   * @description 根据事件ID列表获取收件箱记录
   */
  async getByEventIds(req: DBGetByEventIdsReq): Promise<DBGetByEventIdsRes> {
    const { userId, eventIds } = req
    if (!userId || !eventIds.length)
      return { inboxes: [] }

    const inboxes = await this.db.select()
      .from(notificationInboxes)
      .where(
        and(
          eq(notificationInboxes.userId as any, userId as any),
          inArray(notificationInboxes.eventId as any, eventIds as any),
        ),
      )
      .all()
    return { inboxes }
  }

  /**
   * @description 获取基础未读统计（不考虑游标时间）
   */
  async getBasicUnreadByCategories(req: DBGetBasicUnreadByCategoriesReq): Promise<DBGetBasicUnreadByCategoriesRes> {
    const { userId, categories } = req
    if (!userId)
      return { unreadStats: [] }

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

    const unreadStats = rows.map((row: { category: string, unread: number }) => ({
      category: row.category,
      unread: Number(row.unread) || 0,
    }))
    return { unreadStats }
  }

  /**
   * @description 获取用户指定分类的通知列表（基础查询）
   */
  async getByUserIdAndCategories(req: DBGetByUserIdAndCategoriesReq): Promise<DBGetByUserIdAndCategoriesRes> {
    const { userId, categories, limit = 100 } = req
    if (!userId) return { inboxes: [] }

    const hasCategories = !!categories && categories.length > 0

    const inboxes = await this.db.select()
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
    return { inboxes }
  }

  /**
   * @description 获取指定时间之后指定分类的未读数量
   */
  async getUnreadCountAfterTime(req: DBGetUnreadCountAfterTimeReq): Promise<DBGetUnreadCountAfterTimeRes> {
    const { userId, category, afterTime } = req
    const unreadCount = await this.db.$count(notificationInboxes, and(
      eq(notificationInboxes.userId as any, userId as any),
      eq(notificationInboxes.category as any, category as any),
      gt(notificationInboxes.createdAt as any, afterTime),
      eq(notificationInboxes.isRead as any, 0),
    ))
    return unreadCount
  }
}

export default new dBServiceNotificationInbox()