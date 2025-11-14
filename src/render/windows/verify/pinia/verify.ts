import { defineStore } from 'pinia'

/**
 * @description: 验证窗口状态管理
 */
export const useVerifyStore = defineStore('verifyStore', {
  /**
   * @description: 验证状态
   */
  state: () => ({
    searchData: {
      type: '' as 'friend' | 'group',
      id: '',
      title: '',
      avatar: '',
      conversationId: '',
      source: '',
    },
    verifyType: '',
  }),

  /**
   * @description: 状态计算属性
   */
  getters: {

  },

  /**
   * @description: 状态修改方法
   */
  actions: {
    updateSearchData(data: {
      type: 'friend' | 'group'
      id: string
      title: string
      avatar: string
      source: string
      conversationId: string
    }, verifyType: string) {
      this.searchData = data
      this.verifyType = verifyType
    },
  },
})
