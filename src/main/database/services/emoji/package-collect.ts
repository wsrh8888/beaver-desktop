import { eq, inArray } from 'drizzle-orm'
import dbManager from 'mainModule/database/db'
import { emojiPackageCollect } from 'mainModule/database/tables/emoji/package_collect'

// 表情包收藏服务
export class EmojiPackageCollectService {
  static get db() {
    return dbManager.db
  }

  // 创建表情包收藏
  static async create(collectData: any) {
    return await this.db.insert(emojiPackageCollect).values(collectData).run()
  }

  // 批量创建表情包收藏（upsert操作）
  static async batchCreate(collectList: any[]) {
    if (collectList.length === 0) {
      return
    }

    const results = []
    for (const collectData of collectList) {
      const result = await this.db.insert(emojiPackageCollect)
        .values(collectData)
        .onConflictDoUpdate({
          target: emojiPackageCollect.uuid,
          set: {
            userId: collectData.userId,
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

  // 根据UUID列表获取表情包收藏
  static async getPackageCollectsByUuids(uuids: string[]): Promise<Map<string, any>> {
    if (uuids.length === 0) {
      return new Map()
    }

    const collectList = await this.db
      .select()
      .from(emojiPackageCollect)
      .where(inArray(emojiPackageCollect.uuid, uuids as any))

    const collectMap = new Map<string, any>()
    collectList.forEach((item) => {
      collectMap.set(item.uuid, item)
    })

    return collectMap
  }

  // 根据用户ID获取用户的所有表情包收藏
  static async getPackageCollectsByUserId(userId: string) {
    return await this.db
      .select()
      .from(emojiPackageCollect)
      .where(eq(emojiPackageCollect.userId, userId))
      .all()
  }

  // 根据UUID获取单个表情包收藏
  static async getPackageCollectByUuid(uuid: string) {
    const result = await this.db
      .select()
      .from(emojiPackageCollect)
      .where(eq(emojiPackageCollect.uuid, uuid))
      .limit(1)

    return result[0] || null
  }

  // 删除表情包收藏
  static async delete(uuid: string) {
    return await this.db
      .delete(emojiPackageCollect)
      .where(eq(emojiPackageCollect.uuid, uuid))
      .run()
  }
}
