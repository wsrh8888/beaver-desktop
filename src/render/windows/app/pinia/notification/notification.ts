import { defineStore } from 'pinia'

export interface INotificationSummary {
  total?: number
  byCat?: Array<{ category: string, unread: number }>
}

const DEFAULT_CATEGORIES = ['social', 'group', 'system']

export const useNotificationStore = defineStore('useNotificationStore', {
  state: () => ({
    unreadByCategory: {} as Record<string, number>,
  }),

  getters: {
    /**
     * 按分类取未读，默认0
     */
    getCategoryUnread: (state) => (category: string): number => {
      return state.unreadByCategory[category] ?? 0
    },
  },

  actions: {
    /**
     * 初始化未读数据（默认统计 social/group/system 分类）
     */
    async init(categories: string[] = DEFAULT_CATEGORIES) {
      this.reset()
      try {
        const summary = await window.electron.database.notification.getUnreadSummary({
          categories,
        })
        this.setUnreadSummary(summary)
      }
      catch (_err) {
        // 本地未同步或查询失败时保持为0
      }
    },
    setUnreadSummary(summary: INotificationSummary) {
      const byCat: Record<string, number> = {}
      summary.byCat?.forEach((item) => {
        byCat[item.category] = item.unread
      })
      this.unreadByCategory = byCat
    },
    setCategoryUnread(category: string, count: number) {
      this.unreadByCategory = {
        ...this.unreadByCategory,
        [category]: count,
      }
    },
    reset() {
      this.unreadByCategory = {}
    },
  },
})

