import { and, eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { emojiPackageCollect } from 'mainModule/database/tables/emoji/package_collect'
import type {
  DBCreatePackageCollectReq,
  DBBatchCreatePackageCollectsReq,
  DBGetPackageCollectsByIdsReq,
  DBGetPackageCollectsByIdsRes,
  DBGetPackageCollectsByUserIdReq,
  DBGetPackageCollectsByUserIdRes,
  DBGetPackageCollectByIdReq,
  DBGetPackageCollectByIdRes,
  DBDeletePackageCollectReq,
} from 'commonModule/type/database/server/emoji/package-collect'

// 表情包收藏服务
class EmojiPackageCollect extends BaseService {
  /**
   * @description 创建表情包收藏
   */
  async create(req: DBCreatePackageCollectReq): Promise<void> {
    await this.db.insert(emojiPackageCollect).values(req).run()
  }

  /**
   * @description 批量创建表情包收藏（upsert操作）
   */
  async batchCreate(req: DBBatchCreatePackageCollectsReq): Promise<void> {
    if (req.collects.length === 0) {
      return
    }

    for (const collectData of req.collects) {
      await this.db.insert(emojiPackageCollect)
        .values(collectData)
        .onConflictDoUpdate({
          target: emojiPackageCollect.packageCollectId,
          set: {
            userId: collectData.userId,
            packageId: collectData.packageId,
            version: collectData.version,
            updatedAt: collectData.updatedAt,
          },
        })
        .run()
    }
  }

  /**
   * @description 根据ID列表获取表情包收藏
   */
  async getPackageCollectsByIds(req: DBGetPackageCollectsByIdsReq): Promise<DBGetPackageCollectsByIdsRes> {
    if (req.ids.length === 0) {
      return new Map()
    }

    const collectList = await this.db
      .select()
      .from(emojiPackageCollect)
      .where(inArray(emojiPackageCollect.packageCollectId, req.ids as any))

    const collectMap = new Map<string, IDBEmojiPackageCollect>()
    collectList.forEach((item) => {
      collectMap.set(item.packageCollectId, item)
    })

    return collectMap
  }

  /**
   * @description 根据用户ID获取用户的所有表情包收藏
   */
  async getPackageCollectsByUserId(req: DBGetPackageCollectsByUserIdReq): Promise<DBGetPackageCollectsByUserIdRes> {
    return await this.db
      .select()
      .from(emojiPackageCollect)
      .where(eq(emojiPackageCollect.userId, req.userId))
      .all()
  }

  /**
   * @description 根据ID获取单个表情包收藏
   */
  async getPackageCollectById(req: DBGetPackageCollectByIdReq): Promise<DBGetPackageCollectByIdRes> {
    const result = await this.db
      .select()
      .from(emojiPackageCollect)
      .where(eq(emojiPackageCollect.packageCollectId, req.packageCollectId))
      .limit(1)

    return result[0] || null
  }

  /**
   * @description 删除表情包收藏
   */
  async delete(req: DBDeletePackageCollectReq): Promise<void> {
    await this.db
      .delete(emojiPackageCollect)
      .where(and(eq(emojiPackageCollect.userId, req.userId), eq(emojiPackageCollect.packageId, req.packageId)))
      .run()
  }
}

export default new EmojiPackageCollect()