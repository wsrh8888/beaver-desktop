import type { IDBNotificationReadCursor } from 'commonModule/type/database/notification'
import { and, eq, sql } from 'drizzle-orm'
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
          lastReadAt: sql.raw(`excluded.last_read_at`),
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
}
