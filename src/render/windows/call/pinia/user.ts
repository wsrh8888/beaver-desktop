import { defineStore } from 'pinia'
import { useContactStore } from './contact'

/**
 * @description: 当前用户信息管理
 */
export const useUserStore = defineStore('useUserStore', {
  state: (): {
    currentUserId: string
  } => ({
    currentUserId: '',
  }),

  getters: {
    getUserInfo: (state) => {
      const contactStore = useContactStore()
      // 直接从contactStore获取当前用户的信息
      return contactStore.getContact(state.currentUserId)
    },
    getUserId: (state) => {
      return state.currentUserId
    },
  },

  actions: {
    async init() {
      const storeUserInfo = await electron.storage.getAsync('userInfo')
      if (storeUserInfo) {
        this.currentUserId = storeUserInfo.userId!
      }
    },
  },
})
