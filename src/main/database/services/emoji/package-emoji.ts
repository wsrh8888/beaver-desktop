import { eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { emojiPackageEmoji } from 'mainModule/database/tables/emoji/package_emoji'
import type {
  DBCreatePackageEmojiReq,
  DBBatchCreatePackageEmojisReq,
  DBGetEmojisByPackageIdReq,
  DBGetEmojisByPackageIdRes,
  DBGetEmojisByPackageIdsReq,
  DBGetEmojisByPackageIdsRes,
  DBGetPackagesByEmojiIdReq,
  DBGetPackagesByEmojiIdRes,
  DBDeleteByPackageIdAndEmojiIdReq,
  DBDeleteByPackageIdReq,
} from 'commonModule/type/database/server/emoji/package-emoji'

// 表情包表情关联服务
class EmojiPackageEmoji extends BaseService {
  /**
   * @description 创建表情包表情关联
   */
  async create(req: DBCreatePackageEmojiReq): Promise<void> {
    await this.db.insert(emojiPackageEmoji).values(req).run()
  }

  /**
   * @description 批量创建表情包表情关联（upsert操作）
   */
  async batchCreate(req: DBBatchCreatePackageEmojisReq): Promise<void> {
    if (req.relations.length === 0) {
      return
    }

    for (const relationData of req.relations) {
      await this.db.insert(emojiPackageEmoji)
        .values(relationData)
        .onConflictDoUpdate({
          target: emojiPackageEmoji.relationId,
          set: {
            sortOrder: relationData.sortOrder,
            version: relationData.version,
            updatedAt: relationData.updatedAt,
          },
        })
        .run()
    }
  }

  /**
   * @description 根据表情包ID获取表情列表
   */
  async getEmojisByPackageId(req: DBGetEmojisByPackageIdReq): Promise<DBGetEmojisByPackageIdRes> {
    return await this.db
      .select()
      .from(emojiPackageEmoji)
      .where(eq(emojiPackageEmoji.packageId, req.packageId))
      .all()
  }

  /**
   * @description 根据表情包ID列表获取表情关联数据
   */
  async getEmojisByPackageIds(req: DBGetEmojisByPackageIdsReq): Promise<DBGetEmojisByPackageIdsRes> {
    if (req.packageIds.length === 0) {
      return new Map()
    }

    const relationList = await this.db
      .select()
      .from(emojiPackageEmoji)
      .where(inArray(emojiPackageEmoji.packageId, req.packageIds as any))

    const relations = new Map<string, IDBEmojiPackageEmoji[]>()
    relationList.forEach((item) => {
      if (!relations.has(item.packageId)) {
        relations.set(item.packageId, [])
      }
      relations.get(item.packageId)!.push(item)
    })

    return relations
  }

  /**
   * @description 根据表情ID获取所属的表情包
   */
  async getPackagesByEmojiId(req: DBGetPackagesByEmojiIdReq): Promise<DBGetPackagesByEmojiIdRes> {
    return await this.db
      .select()
      .from(emojiPackageEmoji)
      .where(eq(emojiPackageEmoji.emojiId, req.emojiId))
      .all()
  }

  /**
   * @description 删除表情包中的表情
   */
  async deleteByPackageIdAndEmojiId(req: DBDeleteByPackageIdAndEmojiIdReq): Promise<void> {
    await this.db
      .delete(emojiPackageEmoji)
      .where(eq(emojiPackageEmoji.packageId, req.packageId))
      .where(eq(emojiPackageEmoji.emojiId, req.emojiId))
      .run()
  }

  /**
   * @description 删除表情包中的所有表情
   */
  async deleteByPackageId(req: DBDeleteByPackageIdReq): Promise<void> {
    await this.db
      .delete(emojiPackageEmoji)
      .where(eq(emojiPackageEmoji.packageId, req.packageId))
      .run()
  }
}

export default new EmojiPackageEmoji()