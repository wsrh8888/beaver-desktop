import type { IGroupInfo } from 'commonModule/type/ajax/group'
import { defineStore } from 'pinia'
import {
  getGroupInfoApi,
  getGroupListApi,
} from 'renderModule/api/group'

/**
 * @description: 群组信息管理
 */
export const useGroupStore = defineStore('groupStore', {
  state: (): {
    groupList: IGroupInfo[]
  } => ({
    /**
     * @description: 群组列表，保持有序
     */
    groupList: [],
  }),

  getters: {
    /**
     * @description: 根据群组ID获取群组信息
     */
    getGroupById: state => (groupId: string): IGroupInfo | undefined => {
      return state.groupList.find(group => group.conversationId === groupId)
    },
  },

  actions: {
    /**
     * @description: 重置群组列表
     */
    reset() {
      this.groupList = []
    },

    /**
     * @description: 初始化群组列表
     */
    async init() {
      const getGroupApi = await getGroupListApi({
        page: 1,
        limit: 100,
      })
      if (getGroupApi.code === 0 && getGroupApi.result?.list?.length > 0) {
        this.groupList = getGroupApi.result.list
      }
    },

    /**
     * @description: 更新群组信息
     */
    updateGroupInfo(groupId: string) {
      return getGroupInfoApi({ groupId }).then((res) => {
        if (res.code === 0) {
          const groupInfo = res.result
          const index = this.groupList.findIndex(g => g.conversationId === groupId)
          if (index !== -1) {
            // 更新现有群组信息
            this.groupList[index] = { ...this.groupList[index], ...groupInfo }
          }
        }
        return res
      }).catch((error) => {
        console.error('Failed to update group info:', error)
        throw error
      })
    },

    /**
     * @description: 移除群组
     */
    removeGroup(groupId: string) {
      this.groupList = this.groupList.filter(group => group.conversationId !== groupId)
    },
  },
})
