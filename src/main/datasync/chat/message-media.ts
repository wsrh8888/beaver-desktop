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

import { datasyncGetSyncMessageMediasApi } from 'mainModule/api/datasync'
import messageMediaBusiness from 'mainModule/business/chat/message-media'
import dbServiceDataSync from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-message-media')

class MessageMediaSync {
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      const localCursor = await dbServiceDataSync.get({ module: 'chat_message_medias' })
      const lastSyncTime = localCursor?.updatedAt || 0

      const serverResponse = await datasyncGetSyncMessageMediasApi({ since: lastSyncTime })
      const messageIds = serverResponse.result.messageIds || []

      if (messageIds.length > 0)
        await messageMediaBusiness.batchSave(userId, messageIds)

      await dbServiceDataSync.upsert({
        module: 'chat_message_medias',
        version: -1,
        updatedAt: serverResponse.result.serverTimestamp,
      }).catch(() => {})
    }
    catch (error) {
      logger.error({ text: '消息媒体状态同步失败', data: { error: (error as any)?.message } })
    }
  }
}

export default new MessageMediaSync()
