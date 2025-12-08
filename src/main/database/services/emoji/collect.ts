import { eq, inArray } from 'drizzle-orm'
import dbManager from 'mainModule/database/db'
import { emojiCollect } from 'mainModule/database/tables/emoji/collect'

// 表情收藏服务
export class EmojiCollectService {
  static get db() {
    return dbManager.db
  }

  // 创建表情收藏
  static async create(collectData: any) {
    return await this.db.insert(emojiCollect).values(collectData).run()
  }

  // 批量创建表情收藏（upsert操作）
  static async batchCreate(collectList: any[]) {
    if (collectList.length === 0) {
      return
    }

    const results = []
    for (const collectData of collectList) {
      const result = await this.db.insert(emojiCollect)
        .values(collectData)
        .onConflictDoUpdate({
          target: emojiCollect.emojiCollectId,
          set: {
            userId: collectData.userId,
            emojiId: collectData.emojiId,
            version: collectData.version,
            updatedAt: collectData.updatedAt,
          },
        })
        .run()
      results.push(result)
    }

    return results
  }

  // 根据ID列表获取表情收藏
  static async getCollectsByIds(ids: string[]): Promise<Map<string, any>> {
    if (ids.length === 0) {
      return new Map()
    }

    const collectList = await this.db
      .select()
      .from(emojiCollect)
      .where(inArray(emojiCollect.emojiCollectId, ids as any))

    const collectMap = new Map<string, any>()
    collectList.forEach((item) => {
      collectMap.set(item.emojiCollectId, item)
    })

    return collectMap
  }

  // 根据用户ID获取用户的所有表情收藏
  static async getCollectsByUserId(userId: string) {
    return await this.db
      .select()
      .from(emojiCollect)
      .where(eq(emojiCollect.userId, userId))
      .all()
  }

  // 根据ID获取单个表情收藏
  static async getCollectById(collectId: string) {
    const result = await this.db
      .select()
      .from(emojiCollect)
      .where(eq(emojiCollect.emojiCollectId, collectId))
      .limit(1)

    return result[0] || null
  }

  // 删除表情收藏
  static async delete(collectId: string) {
    return await this.db
      .delete(emojiCollect)
      .where(eq(emojiCollect.emojiCollectId, collectId))
      .run()
  }
}
