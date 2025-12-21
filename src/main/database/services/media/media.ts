import { and, eq } from 'drizzle-orm'
import { BaseService } from '../base'
import { media } from '../../tables/media/media'
import type {
  DBUpsertMediaReq,
  DBGetMediaInfoReq,
  DBGetMediaInfoRes,
  DBDeleteMediaReq,
} from 'commonModule/type/database/server/media/media'

/**
 * 媒体缓存数据库服务
 * 替代之前的JSON索引管理，提供数据库层面的缓存管理
 */
class MediaService extends BaseService {

  /**
   * @description 添加或更新媒体记录
   */
  async upsert(req: DBUpsertMediaReq): Promise<void> {
    const now = Math.floor(Date.now() / 1000)

    // 先尝试查找现有记录
    const existing = await this.db
      .select()
      .from(media)
      .where(eq(media.fileKey as any, req.fileKey))
      .limit(1)

    if (existing.length > 0) {
      // 更新现有记录：更新时间戳，确保未被标记删除
      await this.db
        .update(media)
        .set({
          updatedAt: now,
          isDeleted: 0, // 确保未被标记删除
        })
        .where(eq(media.fileKey as any, req.fileKey))
    }
    else {
      // 插入新记录
      await this.db.insert(media).values({
        fileKey: req.fileKey,
        path: req.path,
        type: req.type,
        size: req.size,
        createdAt: now,
        updatedAt: now,
        isDeleted: 0,
      })
    }
  }

  /**
   * @description 根据文件名获取媒体信息
   */
  async getMediaInfo(req: DBGetMediaInfoReq): Promise<DBGetMediaInfoRes> {
    const result = await this.db
      .select()
      .from(media)
      .where(and(eq(media.fileKey as any, req.fileKey), eq(media.isDeleted as any, 0)))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    const record = result[0]
    return {
      fileKey: record.fileKey,
      path: record.path,
      type: record.type,
      size: record.size || undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      isDeleted: record.isDeleted,
    }
  }

  /**
   * @description 标记为删除状态（软删除）
   */
  async deleteMedia(req: DBDeleteMediaReq): Promise<void> {
    await this.db
      .update(media)
      .set({
        isDeleted: 1,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(media.fileKey as any, req.fileKey))
  }
}

// 导出媒体服务实例
export default new MediaService()
