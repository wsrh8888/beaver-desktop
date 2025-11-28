import { eq, inArray } from 'drizzle-orm'
import dbManager from 'mainModule/database/db'
import { emojiPackageEmoji } from 'mainModule/database/tables/emoji/package_emoji'

// 表情包表情关联服务
export class EmojiPackageEmojiService {
  static get db() {
    return dbManager.db
  }

  // 创建表情包表情关联
  static async create(relationData: any) {
    return await this.db.insert(emojiPackageEmoji).values(relationData).run()
  }

  // 批量创建表情包表情关联（upsert操作）
  static async batchCreate(relationList: any[]) {
    if (relationList.length === 0) {
      return
    }

    const results = []
    for (const relationData of relationList) {
      const result = await this.db.insert(emojiPackageEmoji)
        .values(relationData)
        .onConflictDoUpdate({
          target: [emojiPackageEmoji.packageId, emojiPackageEmoji.emojiId],
          set: {
            uuid: relationData.uuid,
            sortOrder: relationData.sortOrder,
            version: relationData.version,
            updatedAt: relationData.updatedAt,
          },
        })
        .run()
      results.push(result)
    }

    return results
  }

  // 根据表情包ID获取表情列表
  static async getEmojisByPackageId(packageId: number) {
    return await this.db
      .select()
      .from(emojiPackageEmoji)
      .where(eq(emojiPackageEmoji.packageId, packageId))
      .all()
  }

  // 根据表情包ID列表获取表情关联数据
  static async getEmojisByPackageIds(packageIds: number[]): Promise<Map<number, any[]>> {
    if (packageIds.length === 0) {
      return new Map()
    }

    const relationList = await this.db
      .select()
      .from(emojiPackageEmoji)
      .where(inArray(emojiPackageEmoji.packageId, packageIds as any))

    const relationMap = new Map<number, any[]>()
    relationList.forEach((item) => {
      if (!relationMap.has(item.packageId)) {
        relationMap.set(item.packageId, [])
      }
      relationMap.get(item.packageId)!.push(item)
    })

    return relationMap
  }

  // 根据表情ID获取所属的表情包
  static async getPackagesByEmojiId(emojiId: number) {
    return await this.db
      .select()
      .from(emojiPackageEmoji)
      .where(eq(emojiPackageEmoji.emojiId, emojiId))
      .all()
  }

  // 删除表情包中的表情
  static async deleteByPackageIdAndEmojiId(packageId: number, emojiId: number) {
    return await this.db
      .delete(emojiPackageEmoji)
      .where(eq(emojiPackageEmoji.packageId, packageId))
      .where(eq(emojiPackageEmoji.emojiId, emojiId))
      .run()
  }

  // 删除表情包中的所有表情
  static async deleteByPackageId(packageId: number) {
    return await this.db
      .delete(emojiPackageEmoji)
      .where(eq(emojiPackageEmoji.packageId, packageId))
      .run()
  }
}
