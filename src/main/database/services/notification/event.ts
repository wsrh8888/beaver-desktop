import type { IDBNotificationEvent } from 'commonModule/type/database/db/notification'
import { gt, inArray, sql } from 'drizzle-orm'
import { BaseService } from '../base'
import { notificationEvents } from 'mainModule/database/tables/notification/event'
import type {
  DBBatchCreateNotificationEventsReq,
  DBGetEventsAfterVersionReq,
  DBGetEventsAfterVersionRes,
  DBGetVersionMapByIdsReq,
  DBGetVersionMapByIdsRes,
  DBGetNotificationEventsReq,
  DBGetNotificationEventsRes,
} from 'commonModule/type/database/server/notification/event'

// 通知事件表服务
class NotificationEvent extends BaseService {

  /**
   * @description 批量创建通知事件
   */
  async batchCreate(req: DBBatchCreateNotificationEventsReq): Promise<void> {
    if (!req.events.length)
      return

    await this.db.insert(notificationEvents)
      .values(req.events)
      .onConflictDoUpdate({
        target: notificationEvents.eventId,
        set: {
          eventType: sql.raw(`excluded.event_type`),
          category: sql.raw(`excluded.category`),
          version: sql.raw(`excluded.version`),
          fromUserId: sql.raw(`excluded.from_user_id`),
          targetId: sql.raw(`excluded.target_id`),
          targetType: sql.raw(`excluded.target_type`),
          payload: sql.raw(`excluded.payload`),
          priority: sql.raw(`excluded.priority`),
          status: sql.raw(`excluded.status`),
          dedupHash: sql.raw(`excluded.dedup_hash`),
          updatedAt: sql.raw(`excluded.updated_at`),
        },
      })
      .run()
  }

  /**
   * @description 按版本增量拉取事件
   */
  async getEventsAfterVersion(req: DBGetEventsAfterVersionReq): Promise<DBGetEventsAfterVersionRes> {
    const limit = req.limit || 100
    const events = await this.db.select()
      .from(notificationEvents)
      .where(gt(notificationEvents.version as any, req.version as any))
      .orderBy(notificationEvents.version)
      .limit(limit)
      .all()
    return { events }
  }

  /**
   * @description 获取指定事件ID的本地版本映射
   */
  async getVersionMapByIds(req: DBGetVersionMapByIdsReq): Promise<DBGetVersionMapByIdsRes> {
    if (!req.eventIds.length)
      return { versionMap: new Map() }

    const rows = await this.db.select({
      eventId: notificationEvents.eventId,
      version: notificationEvents.version,
    })
      .from(notificationEvents)
      .where(inArray(notificationEvents.eventId as any, req.eventIds as any))
      .all()

    const versionMap = new Map<string, number>()
    rows.forEach((row) => {
      versionMap.set(row.eventId, row.version || 0)
    })
    return { versionMap }
  }

  /**
   * @description 根据事件ID列表获取事件明细
   */
  async getByIds(req: DBGetNotificationEventsReq): Promise<DBGetNotificationEventsRes> {
    if (!req.eventIds.length)
      return { events: [] }

    const events = await this.db.select()
      .from(notificationEvents)
      .where(inArray(notificationEvents.eventId as any, req.eventIds as any))
      .all()
    return { events }
  }
}

export default new NotificationEvent()