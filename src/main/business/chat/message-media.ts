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

import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'
import dbServiceChatMessageMedia from 'mainModule/database/services/chat/message-media'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'

class MessageMediaBusiness {
  async batchSave(userId: string, messageIds: string[]) {
    if (!userId || messageIds.length === 0)
      return

    const now = Math.floor(Date.now() / 1000)
    await dbServiceChatMessageMedia.batchCreate({
      records: messageIds.map(messageId => ({
        userId,
        messageId,
        version: 0,
        createdAt: now,
      })),
    })

    sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.MESSAGE_MEDIA_UPDATE, {
      messageIds,
    })
  }

  async handleTableUpdates(userId: string, messageIds: string[]) {
    const currentUserId = store.get('userInfo')?.userId
    if (!currentUserId || userId !== currentUserId || messageIds.length === 0)
      return

    await this.batchSave(userId, messageIds)
  }
}

export default new MessageMediaBusiness()
