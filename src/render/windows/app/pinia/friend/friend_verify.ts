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
    // 获取验证列表. user基础信息从contact 获取

    /**
     * @description: 获取增强后的验证列表（包含联系人信息）
     */
    getVerifyList: (state) => {
      const contactStore = useContactStore()

      return state.friendVerifyList.map((item) => {
        // 从contactStore获取最新的联系人信息
        const contactInfo = contactStore.getContact(item.userId)
        if (contactInfo) {
          // 返回增强后的验证信息
          return {
            ...item,
            nickName: contactInfo.nickName || item.nickName,
            avatar: contactInfo.avatar || item.avatar,
          }
        }
        return item
      })
    },
  },

  actions: {

    async init() {
      const res = await getValidListApi({
        page: 1,
        limit: 1000,
      })
      this.friendVerifyList = res.result.list || []
    },

    /**
     * @description: 根据用户ID列表更新好友验证数据
     */
    async updateVerifiesByUserIds(updatedVerifies: Array<{ uuid: string, version: number }>) {
      if (updatedVerifies.length === 0) {
        return
      }

      try {
        // 提取用户ID列表
        const userIds = updatedVerifies.map(v => v.uuid)

        // 使用验证记录UUID列表查询获取最新的验证数据
        const result = await electron.database.friend.getValidByUuid({
          uuids: userIds,
        })

        // 更新friend verify store
        for (const verify of result.list) {
          const index = this.friendVerifyList.findIndex(v => v.userId === verify.userId)
          if (index !== -1) {
            this.friendVerifyList[index] = verify
          }
          else {
            this.friendVerifyList.push(verify)
          }
        }

        return result.list
      }
      catch (error) {
        console.error('根据用户ID列表更新好友验证信息失败:', error)
        throw error
      }
    },
  },
})
