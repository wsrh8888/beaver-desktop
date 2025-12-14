import type { IDBNotificationReadCursor } from 'commonModule/type/database/notification'
import { and, eq, sql } from 'drizzle-orm'
import { notificationReads } from 'mainModule/database/tables/notification/read'
import dbManager from '../../db'

// 通知已读游标服务
export class NotificationReadCursorService {
  static get db() {
    return dbManager.db
  }

  // 写入或更新游标
  static async upsertCursor(cursor: IDBNotificationReadCursor): Promise<void> {
    await this.db.insert(notificationReads)
      .values(cursor)
      .onConflictDoUpdate({
        target: [notificationReads.userId, notificationReads.category],
        set: {
          version: sql.raw(`excluded.version`),
          lastReadAt: sql.raw(`excluded.last_read_at`),
          updatedAt: sql.raw(`excluded.updated_at`),
        },
      })
      .run()
  }

  // 查询用户分类游标
  static async getCursor(userId: string, category: string): Promise<IDBNotificationReadCursor | undefined> {
    return await this.db.select()
      .from(notificationReads)
      .where(
        and(
          eq(notificationReads.userId as any, userId as any),
          eq(notificationReads.category as any, category as any),
        ),
      )
      .get()
  }

  // 获取用户游标版本映射（简化版）
  static async getVersionMap(userId: string, categories?: string[]): Promise<Map<string, number>> {
    // 简化逻辑：返回空Map，表示需要同步所有数据
    return new Map()
  }

  // 获取用户多个分类的游标
  static async getCursors(userId: string, categories?: string[]): Promise<IDBNotificationReadCursor[]> {
    if (!userId) return []

    const query = this.db.select()
      .from(notificationReads)
      .where(eq(notificationReads.userId as any, userId as any))

    // 如果指定了分类，则添加分类过滤
    if (categories && categories.length > 0) {
      const { inArray } = await import('drizzle-orm')
      query.where(inArray(notificationReads.category as any, categories as any))
    }

    return await query.all()
  }
}
