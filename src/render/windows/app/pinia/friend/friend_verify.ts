import type { IValidInfo } from 'commonModule/type/ajax/friend'
import { defineStore } from 'pinia'
import { getValidListApi } from 'renderModule/api/friend'
import { useContactStore } from '../contact/contact'

/**
 * @description: 好友信息管理
 */
export const useFriendVerifyStore = defineStore('friendVerifyStore', {
  state: (): {
    friendVerifyList: IValidInfo[]
  } => ({
    /**
     * @description: 好友验证列表
     */
    friendVerifyList: [],
  }),

  getters: {
    /**
     * @description: 获取增强后的验证列表（包含联系人信息）
     */
    getEnhancedVerifyList: (state) => {
      const contactStore = useContactStore()

      return state.friendVerifyList.map((item) => {
        // 从contactStore获取最新的联系人信息
        const contactInfo = contactStore.getContact(item.userId)
        if (contactInfo) {
          // 返回增强后的验证信息
          return {
            ...item,
            nickname: contactInfo.nickName || item.nickname,
            avatar: contactInfo.avatar || item.avatar,
          }
        }
        return item
      })
    },

    /**
     * @description: 根据用户ID获取增强后的验证信息
     */
    getEnhancedVerifyByUserId: state => (userId: string) => {
      const item = state.friendVerifyList.find(v => v.userId === userId)
      if (!item)
        return null

      // 从contactStore获取最新的联系人信息
      const contactStore = useContactStore()
      const contactInfo = contactStore.getContact(userId)
      if (contactInfo) {
        return {
          ...item,
          nickname: contactInfo.nickName || item.nickname,
          avatar: contactInfo.avatar || item.avatar,
        }
      }

      return item
    },
  },

  actions: {

    async init() {
      const res = await getValidListApi({
        page: 1,
        limit: 1000,
      })
      this.friendVerifyList = res.result.list || []

      // 将验证列表中的用户信息同步到联系人缓存中（仅基本信息）
      const contactStore = useContactStore()
      this.friendVerifyList.forEach((item) => {
        if (item.userId) {
          contactStore.updateContact(item.userId, {
            userId: item.userId,
            nickName: item.nickname,
            avatar: item.avatar,
          })
        }
      })
    },
  },
})
