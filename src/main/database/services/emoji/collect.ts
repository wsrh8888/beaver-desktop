import { eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { emojiCollect } from 'mainModule/database/tables/emoji/collect'

// 表情收藏服务
class EmojiCollect extends BaseService {
  // 创建表情收藏
  async create(collectData: any) {
    return await this.db.insert(emojiCollect).values(collectData).run()
  }

  // 批量创建表情收藏（upsert操作）
   async batchCreate(collectList: any[]) {
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
            packageId: collectData.packageId,
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
   async getCollectsByIds(ids: string[]): Promise<Map<string, any>> {
    if (ids.length === 0) {
      return new Map()
    }

    const collectList = await this.db
      .select()
      .from(emojiCollect)
      .where(inArray(emojiCollect.emojiCollectId as any, ids))

    const collectMap = new Map<string, any>()
    collectList.forEach((item: any) => {
      collectMap.set(item.emojiCollectId, item)
    })

    return collectMap
  }

  // 根据用户ID获取用户的所有表情收藏
   async getCollectsByUserId(userId: string) {
    return await this.db
      .select()
      .from(emojiCollect)
      .where(eq(emojiCollect.userId as any, userId))
      .all()
  }

  // 根据ID获取单个表情收藏
   async getCollectById(collectId: string) {
    const result = await this.db
      .select()
      .from(emojiCollect)
      .where(eq(emojiCollect.emojiCollectId as any, collectId))
      .limit(1)

    return result[0] || null
  }

  // 删除表情收藏
   async delete(collectId: string) {
    return await this.db
      .delete(emojiCollect)
      .where(eq(emojiCollect.emojiCollectId as any, collectId))
      .run()
  }
}

// 导出表情收藏服务实例
export default new EmojiCollect()
