import { defineStore } from 'pinia'
import { markReadByEventApi, markReadByCategoryApi, deleteNotificationApi } from 'renderModule/api/notification'

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
    getCategoryUnread: state => (category: string): number => {
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
        console.log('init-summary', summary)
        this.setUnreadSummary(summary)
      }
      catch {
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

    /**
     * 标记单个通知为已读
     */
    async markReadByEvent(eventId: string, category?: string) {
      try {
        await markReadByEventApi({ eventId })

        // 如果提供了分类，减少该分类的未读数量
        if (category) {
          const currentCount = this.getCategoryUnread(category)
          if (currentCount > 0) {
            this.setCategoryUnread(category, currentCount - 1)
          }
        }
      } catch (error) {
        console.error('标记单个通知已读失败:', error)
      }
    },

    /**
     * 标记整个分类为已查看（点击通知入口时调用）
     */
    async markCategoryAsViewed(category: string) {
      try {
        // 获取该分类的未读数量
        const unreadCount = this.getCategoryUnread(category)
        if (unreadCount === 0) {
          return
        }

        // 调用API标记该分类的所有通知为已读
        await markReadByCategoryApi({ category })

        // 更新本地store，将该分类的未读数量设置为0
        this.setCategoryUnread(category, 0)
      } catch (error) {
        console.error('标记分类已查看失败:', error)
        // 即使失败也更新本地store，提升用户体验
        this.setCategoryUnread(category, 0)
      }
    },

    /**
     * 删除单个通知
     */
    async deleteNotification(eventId: string, category?: string) {
      try {
        await deleteNotificationApi({ eventId })

        // 如果提供了分类，减少该分类的未读数量（如果删除的是未读通知）
        // 注意：这里可能需要从服务端重新获取准确的未读数量
        // 暂时简化处理，实际项目中应该重新获取unread summary
        if (category) {
          // 这里可以选择重新获取该分类的未读数量
          // 或者简单地触发一个重新获取的动作
          // this.refreshUnreadSummary()
        }
      } catch (error) {
        console.error('删除通知失败:', error)
      }
    },

    reset() {
      this.unreadByCategory = {}
    },
  },
})
