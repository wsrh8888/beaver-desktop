import { defineStore } from 'pinia'
import type { IStoreDataMap } from 'commonModule/type/mainStore'
import type { IStorageModule } from 'commonModule/type/preload/storage'
import type { IUserInfo } from 'commonModule/type/store/userInfo'

/**
 * @description: 当前用户信息管理
 */
export const useUserStore = defineStore('useUserStore', {
  state: (): {
    currentUserId: string
    users: Map<string, IUserInfo>
    version: number
  } => ({
    currentUserId: '',
    users: new Map(),
    version: 0,
  }),

  getters: {
    getUserId: state => state.currentUserId,
    /**
     * @description 获取用户的基础信息
     */
    getContact: state => (userId: string): IUserInfo => {
      return state.users.get(userId) || {
        userId: '',
        nickName: '',
        avatar: '',
        abstract: '',
        phone: '',
        email: '',
        gender: 0,
        version: 0,
      }
    },
  },

  actions: {
    async init() {
      const storage = electron.storage as IStorageModule
      // 当前用户
      const stored = await storage.getAsync('userInfo')
      this.currentUserId = stored?.userId || ''

      // 所有用户快照（allUser）：object map
      const allUserSnapshot = await electron.storage.getAsync('allUser')
      if (allUserSnapshot && typeof allUserSnapshot === 'object') {
        Object.values(allUserSnapshot as Record<string, any>).forEach((u) => {
          console.error('122222222222222')
          if (u?.userId) {
            this.users.set(u.userId, {
              userId: u.userId,
              nickName: u.nickName || u.userId,
              avatar: u.avatar || '',
              abstract: u.abstract || '',
              phone: u.phone || '',
              email: u.email || '',
              gender: u.gender || 0,
              version: u.version || 0,
            })
          }
        })
      }
      this.version++
    },
  },
})
