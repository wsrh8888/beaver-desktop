import type { IUserInfoRes } from 'commonModule/type/ajax/user'
import { defineStore } from 'pinia'

/**
 * @description: 联系人信息管理
 */
export const useContactStore = defineStore('useContactStore', {
  state: (): {
    user: Map<string, IUserInfoRes>
  } => ({
    user: new Map(),
  }),

  getters: {
    getContact: state => (userId: string) => {
      return state.user.get(userId) || null
    },
  },

  actions: {
    updateContact(userId: string, contactInfo: Partial<IUserInfoRes>) {
      const existing = this.user.get(userId)
      if (existing) {
        this.user.set(userId, {
          ...existing,
          ...contactInfo,
        })
      }
      else {
        // 如果不存在，创建新的（需要完整的用户信息）
        this.user.set(userId, contactInfo as IUserInfoRes)
      }
    },

    reset() {
      this.user.clear()
    },
  },
})
