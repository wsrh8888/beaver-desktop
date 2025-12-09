import type { IDBNotificationEvent } from 'commonModule/type/database/notification'
import { gt, inArray, sql } from 'drizzle-orm'
import { notificationEvents } from 'mainModule/database/tables/notification/event'
import dbManager from '../../db'

// 通知事件表服务
export class NotificationEventService {
  static get db() {
    return dbManager.db
  }

  // 批量写入或更新事件（以 eventId 去重）
  static async batchUpsert(events: IDBNotificationEvent[]): Promise<void> {
    if (!events.length)
      return

    await this.db.insert(notificationEvents)
      .values(events)
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

  // 按版本增量拉取事件
  static async getEventsAfterVersion(version: number, limit = 100): Promise<IDBNotificationEvent[]> {
    return await this.db.select()
      .from(notificationEvents)
      .where(gt(notificationEvents.version as any, version as any))
      .orderBy(notificationEvents.version)
      .limit(limit)
      .all()
  }

  // 获取指定事件ID的本地版本映射
  static async getVersionMapByIds(eventIds: string[]): Promise<Map<string, number>> {
    if (!eventIds.length)
      return new Map()

    const rows = await this.db.select({
      eventId: notificationEvents.eventId,
      version: notificationEvents.version,
    })
      .from(notificationEvents)
      .where(inArray(notificationEvents.eventId as any, eventIds as any))
      .all()

    const map = new Map<string, number>()
    rows.forEach((row) => {
      map.set(row.eventId, row.version || 0)
    })
    return map
  }

  // 根据事件ID列表获取事件明细
  static async getByIds(eventIds: string[]): Promise<IDBNotificationEvent[]> {
    if (!eventIds.length)
      return []

    return await this.db.select()
      .from(notificationEvents)
      .where(inArray(notificationEvents.eventId as any, eventIds as any))
      .all()
  }
}
