import type { IUserInfo } from 'commonModule/type/store/userInfo'
import { defineStore } from 'pinia'

/**
 * @description: 联系人信息管理（数据总称，存储所有用户的完整信息）
 */
export const useContactStore = defineStore('useContactStore', {
  state: (): {
    user: Map<string, IUserInfo>
    version: number // 用于触发响应式更新
  } => ({
    user: new Map(),
    version: 0,
  }),

  getters: {
    getContact: state => (userId: string): IUserInfo => {
      return state.user.get(userId) || {
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
      try {
        // 获取数据库中所有用户数据
        const result = await electron.database.user.getAllUsers()

        // 更新contact store
        result.users.forEach((user) => {
          this.updateContact(user.userId, {
            userId: user.userId,
            nickName: user.nickName,
            avatar: user.avatar || '',
            abstract: user.abstract || '',
            phone: user.phone || '',
            email: user.email || '',
            gender: user.gender || 0,
            version: user.version || 0,
          })
        })

        console.log('联系人数据初始化完成，总数:', this.user.size)
        const contactSnapshot: Record<string, IUserInfo> = {}
        this.user.forEach((val, key) => {
          contactSnapshot[key] = { ...val }
        })
        // 仅写主进程内存，不落盘，避免 Map 造成 clone 失败
        await electron.storage.setAsync('allUser', contactSnapshot, { persist: true })
      }
      catch (error) {
        console.error('联系人数据初始化失败:', error)
        throw error
      }
    },
    updateContact(userId: string, contactInfo: Partial<IUserInfo>, force: boolean = false) {
      const existing = this.user.get(userId)
      let updated = false

      if (existing) {
        // 如果强制更新或新版本号大于等于现有版本号，则更新
        if (force || !contactInfo.version || contactInfo.version >= existing.version) {
          this.user.set(userId, {
            ...existing,
            ...contactInfo,
          })
          updated = true
        }
        // 如果版本号较低且不强制更新，则跳过更新
      }
      else {
        // 如果不存在，创建新的（需要完整信息）
        this.user.set(userId, contactInfo as IUserInfo)
        updated = true
      }
      console.error('更新全部用户模块', this.user)

      // 如果有更新，递增version触发响应式更新
      if (updated) {
        this.version++
      }
    },

    /**
     * @description: 根据用户ID列表批量更新联系人信息
     */
    async updateContactsByIds(userIds: string[]) {
      if (userIds.length === 0) {
        return
      }

      try {
        // 通过electron.database获取用户信息
        const result = await electron.database.user.getUsersBasicInfo({ userIds })
        console.error('222222222222222', result)

        // 更新contact store
        result.users.forEach((user) => {
          this.updateContact(user.userId, {
            userId: user.userId,
            nickName: user.nickName,
            avatar: user.avatar || '',
            abstract: user.abstract || '',
            phone: user.phone || '',
            email: user.email || '',
            gender: user.gender || 0,
            version: user.version || 0,
          })
        })

        return result
      }
      catch (error) {
        console.error('批量更新联系人信息失败:', error)
        throw error
      }
    },

    reset() {
      this.user.clear()
      this.version = 0
    },
  },
})
