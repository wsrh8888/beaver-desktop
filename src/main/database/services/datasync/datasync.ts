import type { ISyncCursor } from 'commonModule/type/database'
import { eq } from 'drizzle-orm'
import dbManager from '../../db'
import { datasync } from '../../tables/datasync/datasync'

// 同步游标服务
export class DataSyncService {
  static get db() {
    return dbManager.db
  }

  // 获取同步游标
  static async get(dataType: string): Promise<ISyncCursor | undefined> {
    return await this.db.select().from(datasync).where(
      eq(datasync.dataType, dataType),
    ).get()
  }

  // 创建或更新同步游标
  static async upsert(cursorData: {
    dataType: string
    lastSeq: number
    syncStatus: string
  }) {
    const existing = await this.get(cursorData.dataType)

    if (existing) {
      return await this.db.update(datasync)
        .set({
          lastSeq: cursorData.lastSeq,
          syncStatus: cursorData.syncStatus,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(datasync.id, existing.id!))
        .run()
    }
    else {
      return await this.db.insert(datasync).values({
        ...cursorData,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      }).run()
    }
  }
}
