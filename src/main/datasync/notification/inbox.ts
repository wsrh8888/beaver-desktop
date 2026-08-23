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

import { NotificationModule, NotificationNotificationCommand } from 'commonModule/type/preload/notification'
import { datasyncGetSyncNotificationInboxesApi } from 'mainModule/api/datasync'
import { getNotificationInboxByIdsApi } from 'mainModule/api/notification'
import dbServiceDataSync  from 'mainModule/database/services/datasync/datasync'
import dBServiceNotificationInbox from 'mainModule/database/services/notification/inbox'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-notification-inbox')

class NotificationInboxSync {
  async checkAndSync() {
    logger.info({ text: '开始同步通知收件箱' })
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      const cursor = await dbServiceDataSync.get({ module: 'notification_inboxes' })
      const sinceVersion = cursor?.version || 0

      const resp = await datasyncGetSyncNotificationInboxesApi({
        sinceVersion,
      })

      const inboxVersions = resp.result.inboxVersions || []
      const needEventIds = await this.filterInboxVersions(userId, inboxVersions)

      if (needEventIds.length > 0)
        await this.syncInboxes(userId, needEventIds)

      const nextVersion = Math.max(
        sinceVersion,
        resp.result.maxVersion || 0,
        ...inboxVersions.map(item => item.version || 0),
      )

      await dbServiceDataSync.upsert({
        module: 'notification_inboxes',
        version: nextVersion,
        updatedAt: resp.result.serverTimestamp,
      }).catch(() => {})

      if (needEventIds.length > 0) {
        sendMainNotification('*', NotificationModule.DATABASE_NOTIFICATION, NotificationNotificationCommand.INBOX_UPDATE, {
          eventIds: needEventIds,
          version: nextVersion,
        })
      }
    }
    catch (error) {
      logger.error({ text: '通知收件箱同步失败', data: { error: (error as any)?.message } })
    }
  }

  private async filterInboxVersions(userId: string, inboxVersions: Array<{ eventId: string, version: number }>): Promise<string[]> {
    if (!inboxVersions || inboxVersions.length === 0)
      return []

    const eventIds = inboxVersions.map(item => item.eventId).filter(id => !!id)
    if (eventIds.length === 0)
      return []

    const localMap = await dBServiceNotificationInbox.getVersionMapByEventIds({ userId, eventIds })

    return inboxVersions
      .filter(item => (localMap.get(item.eventId) || 0) < item.version)
      .map(item => item.eventId)
  }

  private async syncInboxes(userId: string, eventIds: string[]) {
    const batchSize = 50
    for (let i = 0; i < eventIds.length; i += batchSize) {
      const batchIds = eventIds.slice(i, i + batchSize)
      const resp = await getNotificationInboxByIdsApi({ eventIds: batchIds })

      if (resp.result.inbox?.length) {
        const rows = resp.result.inbox.map(inbox => ({
          userId,
          eventId: inbox.eventId,
          eventType: inbox.eventType,
          category: inbox.category,
          version: inbox.version,
          isRead: inbox.isRead ? 1 : 0,
          readAt: inbox.readAt,
          status: inbox.status,
          silent: inbox.silent ? 1 : 0,
          createdAt: inbox.createdAt,
          updatedAt: inbox.updatedAt,
        }))

        await dBServiceNotificationInbox.batchAdd({ inboxes: rows })
      }
    }
  }
}

export const notificationInboxSync = new NotificationInboxSync()
