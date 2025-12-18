import { and, eq } from 'drizzle-orm'
import { BaseService } from '../base'
import { media } from '../../tables/media/media'
import type {
  DBUpsertMediaReq,
  DBGetMediaInfoReq,
  DBGetMediaInfoRes,
  DBDeleteMediaReq,
} from 'commonModule/type/database/server/media/media'

export interface MediaInfo {
  fileName: string
  path: string
  type: string
  size?: number
  createdAt: number
  updatedAt: number
  isDeleted: number
}

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
      .where(eq(media.fileName, req.fileName))
      .limit(1)

    if (existing.length > 0) {
      // 更新现有记录：更新时间戳，确保未被标记删除
      await this.db
        .update(media)
        .set({
          updatedAt: now,
          isDeleted: 0, // 确保未被标记删除
        })
        .where(eq(media.fileName, req.fileName))
    }
    else {
      // 插入新记录
      await this.db.insert(media).values({
        fileName: req.fileName,
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
      .where(and(eq(media.fileName, req.fileName), eq(media.isDeleted, 0)))
      .limit(1)

    if (result.length === 0) {
      return { mediaInfo: null }
    }

    const record = result[0]
    return {
      mediaInfo: {
        fileName: record.fileName,
        path: record.path,
        type: record.type,
        size: record.size || undefined,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        isDeleted: record.isDeleted,
      }
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
      .where(eq(media.fileName, req.fileName))
  }
}

// 导出媒体服务实例
export default new MediaService()
