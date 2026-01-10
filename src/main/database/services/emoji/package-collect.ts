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
import type { IDBEmojiPackageCollect } from 'commonModule/type/database/db/emoji'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('database-emoji-package-collect')

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
   * 注意：使用先查询再插入/更新的方式，避免 onConflictDoUpdate 消耗 AUTOINCREMENT 序列值
   */
  async batchCreate(req: DBBatchCreatePackageCollectsReq): Promise<void> {
    if (req.collects.length === 0) {
      return
    }

    // 批量查询所有已存在的记录
    const packageCollectIds = req.collects.map(c => c.packageCollectId)
    const existingMap = await this.getPackageCollectsByIds({ ids: packageCollectIds })

    // 分离需要插入和更新的记录
    const toInsert: typeof req.collects = []
    const toUpdate: typeof req.collects = []

    for (const collectData of req.collects) {
      if (existingMap.has(collectData.packageCollectId)) {
        toUpdate.push(collectData)
      } else {
        toInsert.push(collectData)
      }
    }

    // 批量插入新记录
    if (toInsert.length > 0) {
      for (const collectData of toInsert) {
        await this.db.insert(emojiPackageCollect).values(collectData).run()
      }
    }

    // 批量更新已存在的记录
    if (toUpdate.length > 0) {
      for (const collectData of toUpdate) {
        const updateData: any = {
          userId: collectData.userId,
          packageId: collectData.packageId,
          version: collectData.version,
        }
        // updatedAt 是可选的，如果存在则更新
        if ('updatedAt' in collectData && collectData.updatedAt !== undefined) {
          updateData.updatedAt = collectData.updatedAt
        }
        await this.db
          .update(emojiPackageCollect)
          .set(updateData)
          .where(eq(emojiPackageCollect.packageCollectId, collectData.packageCollectId))
          .run()
      }
    }
  }

  /**
   * @description 根据ID列表获取表情包收藏
   */
  async getPackageCollectsByIds(req: DBGetPackageCollectsByIdsReq): Promise<DBGetPackageCollectsByIdsRes> {
    try {
    if (req.ids.length === 0) {
      return new Map()
    }

    const collectList = await this.db
      .select()
      .from(emojiPackageCollect)
      .where(inArray(emojiPackageCollect.packageCollectId, req.ids as any))

    const collectMap = new Map<string, IDBEmojiPackageCollect>()
    collectList.forEach((item: IDBEmojiPackageCollect) => {
      collectMap.set(item.packageCollectId, item)
    })

    return collectMap
    }
    catch (error) {
      logger.error({ text: '表情包收藏数据获取失败2', data: { error: (error as any)?.message } })
      return new Map()
    }
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