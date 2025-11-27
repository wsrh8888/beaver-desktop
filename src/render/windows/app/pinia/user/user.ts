import type { IUserInfo } from 'commonModule/type/store/userInfo'
import { defineStore } from 'pinia'
import { updateInfoApi } from 'renderModule/api/user'
import { useContactStore } from '../contact/contact'

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
      const storeUserId = await electron.storage.getAsync('userInfo')
      if (storeUserId) {
        this.currentUserId = storeUserId.userId!
      }
    },

    async updateUserInfo(updates: Partial<IUserInfo>): Promise<boolean> {
      const res = await updateInfoApi(updates)
      if (res.code === 0) {
        // 直接更新到contactStore（用户主动更新，强制更新）
        const contactStore = useContactStore()
        if (Object.keys(updates).length > 0) {
          contactStore.updateContact(this.currentUserId, updates, true)
        }

        return true
      }
      return false
    },

    reset() {
      this.currentUserId = ''
    },
  },
})
