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

import { eq } from 'drizzle-orm'
import type {
  DBBatchCreateMessageMediasReq,
  DBBatchCreateMessageMediasRes,
  DBGetMessageMediaIdsReq,
  DBGetMessageMediaIdsRes,
} from 'commonModule/type/database/server/chat/message-media'
import { chatMessageMedias } from 'mainModule/database/tables/chat/message-media'
import { BaseService } from '../base'

class ChatMessageMediaService extends BaseService {
  async batchCreate(req: DBBatchCreateMessageMediasReq): Promise<DBBatchCreateMessageMediasRes> {
    const { records } = req
    if (records.length === 0)
      return { success: true }

    for (const record of records) {
      await this.db
        .insert(chatMessageMedias)
        .values(record)
        .onConflictDoNothing()
        .run()
    }

    return { success: true }
  }

  async getMessageIds(req: DBGetMessageMediaIdsReq): Promise<DBGetMessageMediaIdsRes> {
    const rows = await this.db
      .select({ messageId: chatMessageMedias.messageId })
      .from(chatMessageMedias)
      .where(eq(chatMessageMedias.userId, req.userId as any))
      .all()

    return {
      messageIds: rows.map(row => row.messageId),
    }
  }
}

export default new ChatMessageMediaService()
