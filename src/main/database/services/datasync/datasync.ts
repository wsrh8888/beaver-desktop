import type { ISyncCursor } from 'commonModule/type/database'
import { eq } from 'drizzle-orm'
import dbManager from '../../db'
import { datasync } from '../../tables/datasync/datasync'

// 同步游标服务
export class DataSyncService {
  static get db() {
    return dbManager.db
  }

  // 获取同步游标 (新接口)
  static async get(module: string): Promise<ISyncCursor | undefined> {
    return await this.db.select().from(datasync).where(
      eq(datasync.module, module),
    ).get()
  }

  // 获取同步游标 (旧接口，向后兼容)
  static async getByDataType(dataType: string): Promise<ISyncCursor | undefined> {
    return this.get(dataType)
  }

  // 创建或更新同步游标 (新接口)
  static async upsert(cursorData: {
    module: string
    version: number | null
  }) {
    const existing = await this.get(cursorData.module)

    if (existing) {
      return await this.db.update(datasync)
        .set({
          version: cursorData.version,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(datasync.id, existing.id!))
        .run()
    }
    else {
      return await this.db.insert(datasync).values({
        ...cursorData,
        updatedAt: Math.floor(Date.now() / 1000),
      }).run()
    }
  }

  // 创建或更新同步游标 (旧接口，向后兼容)
  static async upsertByDataType(cursorData: {
    dataType: string
    lastSeq: number
  }) {
    return this.upsert({
      module: cursorData.dataType,
      version: cursorData.lastSeq,
    })
  }
}
