import type { IDBNotificationReadCursor } from 'commonModule/type/database/db/notification'
import { and, eq, sql } from 'drizzle-orm'
import { BaseService } from '../base'
import { notificationReads } from 'mainModule/database/tables/notification/read'
import type {
  DBUpsertCursorReq,
  DBGetCursorReq,
  DBGetCursorRes,
  DBGetVersionMapReq,
  DBGetVersionMapRes,
  DBGetCursorsReq,
  DBGetCursorsRes,
} from 'commonModule/type/database/server/notification/read-cursor'

// 通知已读游标服务
class NotificationReadCursor extends BaseService {

  /**
   * @description 写入或更新游标
   */
  async upsertCursor(req: DBUpsertCursorReq): Promise<void> {
    await this.db.insert(notificationReads)
      .values(req)
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

  /**
   * @description 查询用户分类游标
   */
  async getCursor(req: DBGetCursorReq): Promise<DBGetCursorRes> {
    const { userId, category } = req
    const cursor = await this.db.select()
      .from(notificationReads)
      .where(
        and(
          eq(notificationReads.userId as any, userId as any),
          eq(notificationReads.category as any, category as any),
        ),
      )
      .get()
    return cursor
  }

  /**
   * @description 获取用户游标版本映射（简化版）
   */
  async getVersionMap(req: DBGetVersionMapReq): Promise<DBGetVersionMapRes> {
    // 简化逻辑：返回空Map，表示需要同步所有数据
    return { versionMap: new Map() }
  }

  /**
   * @description 获取用户多个分类的游标
   */
  async getCursors(req: DBGetCursorsReq): Promise<DBGetCursorsRes> {
    const { userId, categories } = req
    if (!userId) return { cursors: [] }

    const query = this.db.select()
      .from(notificationReads)
      .where(eq(notificationReads.userId as any, userId as any))

    // 如果指定了分类，则添加分类过滤
    if (categories && categories.length > 0) {
      const { inArray } = await import('drizzle-orm')
      query.where(inArray(notificationReads.category as any, categories as any))
    }

    const cursors = await query.all()
    return { cursors }
  }
}

export default new NotificationReadCursor()