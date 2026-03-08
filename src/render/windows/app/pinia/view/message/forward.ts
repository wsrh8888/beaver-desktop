import type { IGetForwardDetailsRes } from 'commonModule/type/ajax/chat'
import { defineStore } from 'pinia'
import { getForwardDetailsApi } from 'renderModule/api/chat'

/**
 * @description: 转发消息查看视图状态
 */
export const useForwardViewStore = defineStore('useForwardViewStore', {
  state: () => ({
    visible: false,
    activeId: '', // 当前显示的详情RecordId
    forwardData: new Map<string, IGetForwardDetailsRes>(), // 记录缓存
  }),

  actions: {
    async open(id: string) {
      if (!id) return
      this.activeId = id
      this.visible = true

      if (!this.forwardData.has(id)) {
        try {
          const res = await getForwardDetailsApi({ recordId: id })
          this.forwardData.set(id, res.result)
        } catch (error) {
          console.error('加载合并转发详情失败:', error)
        }
      }
    },

    close() {
      this.visible = false
      this.activeId = ''
    }
  },
})
