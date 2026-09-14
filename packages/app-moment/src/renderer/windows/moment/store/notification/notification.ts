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

import { defineStore } from 'pinia'
import { markReadByCategoryApi } from 'renderModule/api/notification'
import { useUserStore } from '../user/user'
import Logger from 'renderModule/utils/logger';
const logger = new Logger('notification')


export interface IMomentInteractionItem {
  eventId: string
  eventType: string
  fromUserId: string
  fromUserName: string
  fromAvatar: string
  momentId: string
  commentId?: string
  content?: string
  createdAt: number
  isRead: boolean
}

function parsePayload(raw?: string | null): Record<string, any> {
  if (!raw)
    return {}
  try {
    return JSON.parse(raw)
  }
  catch {
      logger.error({ text: 'parsePayload 失败' })
    return {}
  }
}

function getActionText(eventType: string) {
    logger.info({ text: 'getActionText 开始' })
  switch (eventType) {
    case 'moment_like':
      return '赞了你的朋友圈'
    case 'moment_comment':
      return '评论了你'
    case 'moment_comment_reply':
      return '回复了你'
    default:
      return '互动了你的朋友圈'
  }
}

export const useMomentNotificationStore = defineStore('useMomentNotificationStore', {
  state: () => ({
    unreadCount: 0,
    showMessagesPanel: false,
    interactions: [] as IMomentInteractionItem[],
    loading: false,
  }),

  getters: {
    getActionText: () => getActionText,
  },

  actions: {
    async refreshUnreadCount() {
    logger.info({ text: 'refreshUnreadCount 开始' })
      try {
        const summary = await window.electron.database.notification.getUnreadSummary({
          categories: ['moment'],
        })
        const momentCat = summary?.byCat?.find((item: { category: string }) => item.category === 'moment')
        this.unreadCount = momentCat?.unread ?? 0
      }
      catch {
      logger.error({ text: 'refreshUnreadCount 失败' })
        this.unreadCount = 0
      }
    },

    async loadInteractions() {
    logger.info({ text: 'loadInteractions 开始' })
      this.loading = true
      try {
        const inboxRes = await window.electron.database.notification.getInboxByCategory({
          category: 'moment',
          limit: 100,
        })
        const inboxes = inboxRes?.inboxes || []
        if (!inboxes.length) {
          this.interactions = []
          return
        }

        const eventIds = inboxes.map((item: { eventId: string }) => item.eventId)
        const eventsRes = await window.electron.database.notification.getEventsByIds({ eventIds })
        const eventList = Array.isArray(eventsRes)
          ? eventsRes
          : (eventsRes?.events || [])
        const eventMap = new Map(eventList.map((event: any) => [event.eventId, event]))
        const userStore = useUserStore()

        this.interactions = inboxes
          .map((inbox: any) => {
            const event = eventMap.get(inbox.eventId)
            if (!event || event.eventType === 'moment_unlike')
              return null

            const payload = parsePayload(event.payload)
            const momentId = payload.momentId || event.targetId
            if (!momentId)
              return null

            const fromUserId = event.fromUserId || ''
            const contact = fromUserId ? userStore.getContact(fromUserId) : null

            return {
              eventId: inbox.eventId,
              eventType: event.eventType,
              fromUserId,
              fromUserName: contact?.nickName || contact?.userId || '好友',
              fromAvatar: contact?.avatar || '',
              momentId,
              commentId: payload.commentId,
              content: payload.content,
              createdAt: inbox.createdAt || event.createdAt || 0,
              isRead: !!inbox.isRead,
            } as IMomentInteractionItem
          })
          .filter(Boolean) as IMomentInteractionItem[]
      }
      catch {
      logger.error({ text: 'loadInteractions 失败' })
        this.interactions = []
      }
      finally {
        this.loading = false
      }
    },

    async openMessagesPanel() {
    logger.info({ text: 'openMessagesPanel 开始' })
      this.showMessagesPanel = true
      await this.loadInteractions()
      await this.markCategoryAsViewed()
    },

    closeMessagesPanel() {
    logger.info({ text: 'closeMessagesPanel 开始' })
      this.showMessagesPanel = false
    },

    async markCategoryAsViewed() {
    logger.info({ text: 'markCategoryAsViewed 开始' })
      if (this.unreadCount === 0)
        return

      try {
        await markReadByCategoryApi({ category: 'moment' })
      }
      catch {
      logger.error({ text: 'markCategoryAsViewed 失败' })
        // ignore
      }
      finally {
        this.unreadCount = 0
      }
    },

    async handleInboxUpdate() {
    logger.info({ text: 'handleInboxUpdate 开始' })
      await this.refreshUnreadCount()
      if (this.showMessagesPanel) {
        await this.loadInteractions()
      }
    },
  },
})
