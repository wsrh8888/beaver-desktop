import type { IUserInfoRes } from 'commonModule/type/ajax/user'
import { defineStore } from 'pinia'
import { updateInfoApi } from 'renderModule/api/user'
import { useContactStore } from '../contact/contact'

/**
 * @description: 当前用户信息管理
 */
export const useUserStore = defineStore('useUserStore', {
  state: (): {
    userInfo: IUserInfoRes
  } => ({
    userInfo: {
      userId: '',
      nickName: '',
      avatar: '',
      abstract: '',
      gender: 0,
    },
  }),

  actions: {
    async init() {
      const userInfo = await electron.database.user.getUserInfo()
      if (userInfo) {
        this.userInfo = userInfo

        // 同步到contactStore
        const contactStore = useContactStore()
        contactStore.updateContact(userInfo.userId, userInfo)
      }
    },

    async updateUserInfo(updates: Partial<IUserInfoRes>) {
      const res = await updateInfoApi(updates)
      if (res.code === 0) {
        this.userInfo = {
          ...this.userInfo,
          ...updates,
        }

        // 同步更新到contactStore，确保数据一致性
        const contactStore = useContactStore()
        contactStore.updateContact(this.userInfo.userId, updates)

        return true
      }
      return false
    },

    reset() {
      this.userInfo = {
        userId: '',
        nickName: '',
        avatar: '',
        abstract: '',
        gender: 0,
      }
    },
  },
})
