import { eq } from 'drizzle-orm'
import { BaseService } from '../base'
import { datasync } from '../../tables/datasync/datasync'
import type {
  DBGetSyncCursorReq,
  DBGetSyncCursorRes,
  DBGetByDataTypeReq,
  DBGetByDataTypeRes,
  DBUpsertSyncCursorReq,
  DBUpsertByDataTypeReq,
} from 'commonModule/type/database/server/datasync/datasync'

// 同步游标服务
class DataSync extends BaseService {
  /**
   * @description 获取同步游标 (新接口)
   */
  async get(req: DBGetSyncCursorReq): Promise<DBGetSyncCursorRes> {
    const cursor = await this.db.select().from(datasync).where(
      eq(datasync.module as any, req.module),
    ).get()
    return { cursor }
  }

  /**
   * @description 获取同步游标 (旧接口，向后兼容)
   */
  async getByDataType(req: DBGetByDataTypeReq): Promise<DBGetByDataTypeRes> {
    return await this.get({ module: req.dataType })
  }

  /**
   * @description 创建或更新同步游标 (新接口)
   */
  async upsert(req: DBUpsertSyncCursorReq): Promise<void> {
    const existing = await this.get({ module: req.cursorData.module })

    if (existing.cursor) {
      await this.db.update(datasync)
        .set({
          version: req.cursorData.version,
          updatedAt: req.cursorData.updatedAt,
        })
        .where(eq(datasync.id as any, existing.cursor.id!))
        .run()
    }
    else {
      await this.db.insert(datasync).values(req.cursorData).run()
    }
  }

  /**
   * @description 创建或更新同步游标 (旧接口，向后兼容)
   */
  async upsertByDataType(req: DBUpsertByDataTypeReq): Promise<void> {
    return this.upsert({
      cursorData: {
        module: req.cursorData.dataType,
        version: req.cursorData.lastSeq,
      }
    })
  }
}

// 导出数据同步服务实例
export default new DataSync()
