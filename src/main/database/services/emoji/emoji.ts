
import { eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { emoji } from 'mainModule/database/tables/emoji/emoji'
import type {
  DBCreateEmojiReq,
  DBBatchCreateEmojisReq,
  DBGetEmojisByIdsReq,
  DBGetEmojisByIdsRes,
  DBGetAllEmojisReq,
  DBGetAllEmojisRes,
  DBGetEmojiByIdReq,
  DBGetEmojiByIdRes,
} from 'commonModule/type/database/server/emoji/emoji'

// 表情服务
class Emoji extends BaseService {
  /**
   * @description 创建表情
   */
  async create(req: DBCreateEmojiReq): Promise<void> {
    await this.db.insert(emoji).values(req).run()
  }

  /**
   * @description 批量创建表情（upsert操作）
   */
  async batchCreate(req: DBBatchCreateEmojisReq): Promise<void> {
    if (req.emojiList.length === 0) {
      return
    }

    for (const emojiData of req.emojiList) {
      await this.db.insert(emoji)
        .values(emojiData)
        .onConflictDoUpdate({
          target: emoji.emojiId,
          set: {
            fileKey: emojiData.fileKey,
            title: emojiData.title,
            status: emojiData.status,
            version: emojiData.version,
            updatedAt: emojiData.updatedAt,
          },
        })
        .run()
    }
  }

  /**
   * @description 根据ID列表获取表情
   */
  async getEmojisByIds(req: DBGetEmojisByIdsReq): Promise<DBGetEmojisByIdsRes> {
    if (req.ids.length === 0) {
      return { emojis: new Map() }
    }

    const emojiList = await this.db
      .select()
      .from(emoji)
      .where(inArray(emoji.emojiId, req.ids as any))

    const emojiMap = new Map<string, IDBEmoji>()
    emojiList.forEach((item) => {
      emojiMap.set(item.emojiId, item)
    })

    return { emojis: emojiMap }
  }

  /**
   * @description 获取所有表情
   */
  async getAllEmojis(req: DBGetAllEmojisReq): Promise<DBGetAllEmojisRes> {
    const emojis = await this.db.select().from(emoji).all()
    return { emojis }
  }

  /**
   * @description 根据ID获取单个表情
   */
  async getEmojiById(req: DBGetEmojiByIdReq): Promise<DBGetEmojiByIdRes> {
    const result = await this.db
      .select()
      .from(emoji)
      .where(eq(emoji.emojiId, req.id))
      .limit(1)

    return { emoji: result[0] || null }
  }
}

export default new Emoji()