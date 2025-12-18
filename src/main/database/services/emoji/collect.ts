import { eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { emojiCollect } from 'mainModule/database/tables/emoji/collect'
import type {
  DBCreateEmojiCollectReq,
  DBBatchCreateEmojiCollectsReq,
  DBGetEmojiCollectsByIdsReq,
  DBGetEmojiCollectsByIdsRes,
  DBGetEmojiCollectsByUserIdReq,
  DBGetEmojiCollectsByUserIdRes,
  DBGetEmojiCollectByIdReq,
  DBGetEmojiCollectByIdRes,
  DBDeleteEmojiCollectReq,
} from 'commonModule/type/database/server/emoji/collect'
import { IDBEmojiCollect } from 'commonModule/type/database/db/emoji'

// 表情收藏服务
class EmojiCollect extends BaseService {
  /**
   * @description 创建表情收藏
   */
  async create(req: DBCreateEmojiCollectReq): Promise<void> {
    await this.db.insert(emojiCollect).values(req).run()
  }

  /**
   * @description 批量创建表情收藏（upsert操作）
   */
  async batchCreate(req: DBBatchCreateEmojiCollectsReq): Promise<void> {
    const { collects } = req
    if (collects.length === 0) {
      return
    }

    for (const collectData of collects) {
      await this.db.insert(emojiCollect)
        .values(collectData)
        .onConflictDoUpdate({
          target: emojiCollect.emojiCollectId,
          set: {
            userId: collectData.userId,
            emojiId: collectData.emojiId,
            packageId: collectData.packageId,
            version: collectData.version,
            updatedAt: collectData.updatedAt,
          },
        })
        .run()
    }
  }

  /**
   * @description 根据ID列表获取表情收藏
   */
  async getCollectsByIds(req: DBGetEmojiCollectsByIdsReq): Promise<DBGetEmojiCollectsByIdsRes> {
    const { ids } = req
    if (ids.length === 0) {
      return new Map()
    }

    const collectList = await this.db
      .select()
      .from(emojiCollect)
      .where(inArray(emojiCollect.emojiCollectId as any, ids))

    const collectMap = new Map<string, IDBEmojiCollect>()
    collectList.forEach((item) => {
      collectMap.set(item.emojiCollectId, item)
    })

    return collectMap
  }

  /**
   * @description 根据用户ID获取用户的所有表情收藏
   */
  async getCollectsByUserId(req: DBGetEmojiCollectsByUserIdReq): Promise<DBGetEmojiCollectsByUserIdRes> {
    const { userId } = req
    return await this.db
      .select()
      .from(emojiCollect)
      .where(eq(emojiCollect.userId as any, userId))
      .all()
  }

  /**
   * @description 根据ID获取单个表情收藏
   */
  async getCollectById(req: DBGetEmojiCollectByIdReq): Promise<DBGetEmojiCollectByIdRes> {
    const { id } = req
    const result = await this.db
      .select()
      .from(emojiCollect)
      .where(eq(emojiCollect.emojiCollectId as any, id))
      .limit(1)

    return result[0] || null
  }

  /**
   * @description 删除表情收藏
   */
  async delete(req: DBDeleteEmojiCollectReq): Promise<void> {
    const { id } = req
    await this.db
      .delete(emojiCollect)
      .where(eq(emojiCollect.emojiCollectId as any, id))
      .run()
  }
}

// 导出表情收藏服务实例
export default new EmojiCollect()
