import type { IValidInfo } from 'commonModule/type/ajax/friend'
import { defineStore } from 'pinia'

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

  },

  actions: {

    async init() {
      const res = await electron.database.friend.getValidList({
        page: 1,
        limit: 1000,
      })
      this.friendVerifyList = res.list || []
    },
  },
})
