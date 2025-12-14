import { eq, inArray } from 'drizzle-orm'
import dbManager from 'mainModule/database/db'
import { emoji } from 'mainModule/database/tables/emoji/emoji'

// 表情服务
export class EmojiService {
  static get db() {
    return dbManager.db
  }

  // 创建表情
  static async create(emojiData: any) {
    return await this.db.insert(emoji).values(emojiData).run()
  }

  // 批量创建表情（upsert操作）
  static async batchCreate(emojiList: any[]) {
    if (emojiList.length === 0) {
      return
    }

    const results = []
    for (const emojiData of emojiList) {
      const result = await this.db.insert(emoji)
        .values(emojiData)
        .onConflictDoUpdate({
          target: emoji.emojiId,
          set: {
            fileKey: emojiData.fileKey,
            title: emojiData.title,
            emojiInfo: emojiData.emojiInfo,
            status: emojiData.status,
            version: emojiData.version,
            updatedAt: emojiData.updatedAt,
          },
        })
        .run()
      results.push(result)
    }

    return results
  }

  // 根据ID列表获取表情
  static async getEmojisByIds(ids: string[]): Promise<Map<string, any>> {
    if (ids.length === 0) {
      return new Map()
    }

    const emojiList = await this.db
      .select()
      .from(emoji)
      .where(inArray(emoji.emojiId, ids as any))

    const emojiMap = new Map<string, any>()
    emojiList.forEach((item) => {
      emojiMap.set(item.emojiId, item)
    })

    return emojiMap
  }

  // 获取所有表情
  static async getAllEmojis() {
    return await this.db.select().from(emoji).all()
  }

  // 根据ID获取单个表情
  static async getEmojiById(id: string) {
    const result = await this.db
      .select()
      .from(emoji)
      .where(eq(emoji.emojiId, id))
      .limit(1)

    return result[0] || null
  }
}
