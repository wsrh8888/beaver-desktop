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

    /**
     * @description: 根据用户ID列表批量更新联系人信息
     */
    async updateContactsByIds(userIds: string[]) {
      if (userIds.length === 0) {
        return
      }

      try {
        // 通过electron.database获取完整的用户信息
        const result = await electron.database.user.getUsersBasicInfo({ userIds })

        // 更新contact store
        for (const user of result.users) {
          this.updateContact(user.userId, {
            userId: user.userId,
            nickName: user.nickname,
            avatar: user.avatar,
            abstract: user.abstract,
            phone: user.phone,
            email: user.email,
            gender: user.gender,
          } as any)
        }

        return result.users
      } catch (error) {
        console.error('批量更新联系人信息失败:', error)
        throw error
      }
    },

    reset() {
      this.user.clear()
    },
  },
})
