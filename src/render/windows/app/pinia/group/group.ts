import type { IGroupInfo } from 'commonModule/type/ajax/group'
import { defineStore } from 'pinia'
import { getGroupInfoApi } from 'renderModule/api/group'

/**
 * @description: 群组信息管理
 */
export const useGroupStore = defineStore('groupStore', {
  state: (): {
    _groupList: IGroupInfo[]
  } => ({
    /**
     * @description: 群组列表，保持有序（私有）
     */
    _groupList: [],
  }),

  getters: {
    /**
     * @description: 获取群组列表
     */
    getGroupList: (state) => {
      return state._groupList
    },
    /**
     * @description: 根据会话ID获取群组信息
     */
    getGroupById: state => (conversationId: string): IGroupInfo | undefined => {
      return state._groupList.find(group => group.conversationId === conversationId)
    },
    /**
     * @description: 根据会话ID查询群组ID
     */
    getGroupIdByConversationId: state => (conversationId: string): string => {
      const group = state._groupList.find(g => g.conversationId === conversationId)
      return group ? group.groupId : ''
    },
  },

  actions: {
    /**
     * @description: 重置群组列表
     */
    reset() {
      this._groupList = []
    },

    /**
     * @description: 初始化群组列表
     */
    async init() {
      const result = await electron.database.group.getGroupList({
        page: 1,
        limit: 100,
      })
      this._groupList = result?.list || []
    },

    /**
     * @description: 更新群组信息
     */
    updateGroupInfo(groupId: string) {
      return getGroupInfoApi({ groupId }).then((res) => {
        if (res.code === 0) {
          const groupInfo = res.result
          const index = this._groupList.findIndex(g => g.conversationId === groupId)
          if (index !== -1) {
            // 更新现有群组信息
            this._groupList[index] = { ...this._groupList[index], ...groupInfo }
          }
        }
        return res
      }).catch((error) => {
        console.error('Failed to update group info:', error)
        throw error
      })
    },

    /**
     * @description: 直接更新群组信息（用于推送通知）
     */
    upsertGroup(groupData: IGroupInfo) {
      const index = this._groupList.findIndex(g => g.conversationId === groupData.conversationId)
      if (index !== -1) {
        // 更新现有群组
        this._groupList[index] = { ...this._groupList[index], ...groupData }
      }
      else {
        // 添加新群组
        this._groupList.push(groupData)
      }
    },

    /**
     * @description: 根据群组ID列表批量更新群组信息
     */
    async updateGroupsByIds(groupIds: string[]) {
      if (groupIds.length === 0) {
        return
      }

      try {
        // 通过electron.database批量获取指定的群组信息
        const result = await electron.database.group.getGroupsBatch({ groupIds })

        // 更新group store
        for (const group of result.list) {
          this.upsertGroup({
            conversationId: group.conversationId,
            title: group.title,
            avatar: group.avatar,
            version: group.version,
          } as any)
        }

        return result.list
      }
      catch (error) {
        console.error('批量更新群组信息失败:', error)
        throw error
      }
    },

    /**
     * @description: 移除群组
     */
    removeGroup(groupId: string) {
      this._groupList = this._groupList.filter(group => group.conversationId !== groupId)
    },
  },
})
