import { defineStore } from 'pinia'
import { markReadByCategoryApi } from 'renderModule/api/notification'
import { useUserStore } from '../user/user'

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
    return {}
  }
}

function getActionText(eventType: string) {
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
      try {
        const summary = await window.electron.database.notification.getUnreadSummary({
          categories: ['moment'],
        })
        const momentCat = summary?.byCat?.find((item: { category: string }) => item.category === 'moment')
        this.unreadCount = momentCat?.unread ?? 0
      }
      catch {
        this.unreadCount = 0
      }
    },

    async loadInteractions() {
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
        this.interactions = []
      }
      finally {
        this.loading = false
      }
    },

    async openMessagesPanel() {
      this.showMessagesPanel = true
      await this.loadInteractions()
      await this.markCategoryAsViewed()
    },

    closeMessagesPanel() {
      this.showMessagesPanel = false
    },

    async markCategoryAsViewed() {
      if (this.unreadCount === 0)
        return

      try {
        await markReadByCategoryApi({ category: 'moment' })
      }
      catch {
        // ignore
      }
      finally {
        this.unreadCount = 0
      }
    },

    async handleInboxUpdate() {
      await this.refreshUnreadCount()
      if (this.showMessagesPanel) {
        await this.loadInteractions()
      }
    },
  },
})
