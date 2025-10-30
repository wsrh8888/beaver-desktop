import { and, eq } from 'drizzle-orm'
import dbManager from '../../db'
import { media } from '../../tables/media/media'

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
export class MediaService {
  private get db() {
    return dbManager.db
  }

  /**
   * 添加或更新媒体记录
   */
  async upsert(fileName: string, path: string, type: string, size?: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000)

    // 先尝试查找现有记录
    const existing = await this.db
      .select()
      .from(media)
      .where(eq(media.fileName, fileName))
      .limit(1)

    if (existing.length > 0) {
      // 更新现有记录：更新时间戳，确保未被标记删除
      await this.db
        .update(media)
        .set({
          updatedAt: now,
          isDeleted: 0, // 确保未被标记删除
        })
        .where(eq(media.fileName, fileName))
    }
    else {
      // 插入新记录
      await this.db.insert(media).values({
        fileName,
        path,
        type,
        size,
        createdAt: now,
        updatedAt: now,
        isDeleted: 0,
      })
    }
  }

  /**
   * 根据文件名获取媒体信息
   */
  async getMediaInfo(fileName: string): Promise<MediaInfo | null> {
    const result = await this.db
      .select()
      .from(media)
      .where(and(eq(media.fileName, fileName), eq(media.isDeleted, 0)))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    const record = result[0]
    return {
      fileName: record.fileName,
      path: record.path,
      type: record.type,
      size: record.size || undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      isDeleted: record.isDeleted,
    }
  }

  /**
   * 标记为删除状态（软删除）
   */
  async deleteMedia(fileName: string): Promise<void> {
    await this.db
      .update(media)
      .set({
        isDeleted: 1,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(media.fileName, fileName))
  }
}

// 导出单例实例
export const mediaCacheService = new MediaService()
export default mediaCacheService
