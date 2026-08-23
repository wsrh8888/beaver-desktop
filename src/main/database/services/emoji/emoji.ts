/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
      return new Map()
    }

    const emojiList = await this.db
      .select()
      .from(emoji)
      .where(inArray(emoji.emojiId, req.ids as any))

    const emojiMap = new Map<string, IDBEmoji>()
    emojiList.forEach((item) => {
      emojiMap.set(item.emojiId, item)
    })

    return emojiMap
  }

  /**
   * @description 获取所有表情
   */
  async getAllEmojis(req: DBGetAllEmojisReq): Promise<DBGetAllEmojisRes> {
    return await this.db.select().from(emoji).all()
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

    return result[0] || null
  }
}

export default new Emoji()