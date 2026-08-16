import type { ICircleListItem } from 'commonModule/type/ajax/circle'
import { defineStore } from 'pinia'
import { getMyCircleListApi } from 'renderModule/api/circle'

function parseCircleId(conversationId: string) {
  if (!conversationId.startsWith('circle_'))
    return conversationId
  return conversationId.slice('circle_'.length)
}

/**
 * 圈子独立窗口用：仅缓存「我的圈子」列表（HTTP）。
 * 主窗会话列表请用 app/pinia/circle，不要混用。
 */
export const useCircleStore = defineStore('useCircleWindowStore', {
  state: () => ({
    myCircles: [] as ICircleListItem[],
  }),
  actions: {
    parseCircleId,
    async loadMyCircles() {
      const res = await getMyCircleListApi({ page: 1, limit: 100 })
      if (res.code !== 0)
        return
      this.myCircles = res.result.list || []
    },
  },
})

export { parseCircleId }
