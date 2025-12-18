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
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync')

// 同步游标服务
class DataSync extends BaseService {
  /**
   * @description 获取同步游标 (新接口)
   */
  async get(req: DBGetSyncCursorReq): Promise<DBGetSyncCursorRes> {
    try {
    const cursor = await this.db.select().from(datasync).where(
      eq(datasync.module as any, req.module),
    ).get()
    return cursor
    }
    catch (error) {
      logger.error({ text: '获取同步游标失败 get', data: { error: (error as any)?.message } })
      return undefined
    }
  }

  /**
   * @description 获取同步游标 (旧接口，向后兼容)
   */
  async getByDataType(req: DBGetByDataTypeReq): Promise<DBGetByDataTypeRes> {
    try {
      return await this.get({ module: req.dataType })
    }
    catch (error) {
      logger.error({ text: '获取同步游标失败', data: { error: (error as any)?.message } })
      return undefined
    }
  }

  /**
   * @description 创建或更新同步游标 (新接口)
   */
  async upsert(req: DBUpsertSyncCursorReq): Promise<void> {
    const existing = await this.get({ module: req.module })

    if (existing) {
      await this.db.update(datasync)
        .set({
          version: req.version,
          updatedAt: req.updatedAt,
        })
        .where(eq(datasync.id as any, existing.id!))
        .run()
    }
    else {
      await this.db.insert(datasync).values(req).run()
    }
  }

  /**
   * @description 创建或更新同步游标 (旧接口，向后兼容)
   */
  async upsertByDataType(req: DBUpsertByDataTypeReq): Promise<void> {
    return this.upsert({
      module: req.dataType,
      version: req.lastSeq,
    })
  }
}

// 导出数据同步服务实例
export default new DataSync()
