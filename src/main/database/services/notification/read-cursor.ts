import type { IDBNotificationReadCursor } from 'commonModule/type/database/notification'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { notificationReadCursors } from 'mainModule/database/tables/notification/read-cursor'
import dbManager from '../../db'

// 通知已读游标服务
export class NotificationReadCursorService {
  static get db() {
    return dbManager.db
  }

  // 写入或更新游标
  static async upsertCursor(cursor: IDBNotificationReadCursor): Promise<void> {
    await this.db.insert(notificationReadCursors)
      .values(cursor)
      .onConflictDoUpdate({
        target: [notificationReadCursors.userId, notificationReadCursors.category],
        set: {
          version: sql.raw(`excluded.version`),
          lastEventId: sql.raw(`excluded.last_event_id`),
          lastReadAt: sql.raw(`excluded.last_read_at`),
          lastReadTime: sql.raw(`excluded.last_read_time`),
          updatedAt: sql.raw(`excluded.updated_at`),
        },
      })
      .run()
  }

  // 查询用户分类游标
  static async getCursor(userId: string, category: string): Promise<IDBNotificationReadCursor | undefined> {
    return await this.db.select()
      .from(notificationReadCursors)
      .where(
        and(
          eq(notificationReadCursors.userId as any, userId as any),
          eq(notificationReadCursors.category as any, category as any),
        ),
      )
      .get()
  }

  // 获取用户游标版本映射
  static async getVersionMap(userId: string, categories?: string[]): Promise<Map<string, number>> {
    if (!userId)
      return new Map()

    const hasCategories = !!categories && categories.length > 0
    const rows = await this.db.select({
      category: notificationReadCursors.category,
      version: notificationReadCursors.version,
    })
      .from(notificationReadCursors)
      .where(
        hasCategories
          ? and(
            eq(notificationReadCursors.userId as any, userId as any),
            inArray(notificationReadCursors.category as any, categories as any),
          )
          : eq(notificationReadCursors.userId as any, userId as any),
      )
      .all()

    const map = new Map<string, number>()
    rows.forEach((row) => {
      map.set(row.category, row.version || 0)
    })
    return map
  }

  // 获取用户已读游标列表（可按分类过滤）
  static async getCursors(userId: string, categories?: string[]): Promise<IDBNotificationReadCursor[]> {
    if (!userId)
      return []

    const hasCategories = !!categories && categories.length > 0
    return await this.db.select()
      .from(notificationReadCursors)
      .where(
        hasCategories
          ? and(
            eq(notificationReadCursors.userId as any, userId as any),
            inArray(notificationReadCursors.category as any, categories as any),
          )
          : eq(notificationReadCursors.userId as any, userId as any),
      )
      .all()
  }
}
