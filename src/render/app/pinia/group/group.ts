import type {
  IGroupInfo,
  IGroupMember,
} from 'commonModule/type/ajax/group'
import { defineStore } from 'pinia'
import {
  getGroupInfoApi,
  getGroupListApi,
  getGroupMembersApi,
} from 'renderModule/api/group'

interface IMemberCache {
  memberList: IGroupMember[]
  lastUpdateTime: number
}

export const useGroupStore = defineStore('useGroupStore', {
  state: (): {
    _groupMap: Map<string, IGroupInfo>
    _memberMap: Map<string, IMemberCache>

  } => ({
    /**
     * @description: 群组列表Map形式，作为唯一数据源
     */
    _groupMap: new Map(),
    /**
     * @description: 群成员Map，key为群组ID
     */
    _memberMap: new Map(),

  }),

  getters: {
    /**
     * @description: 群组列表，通过Map动态生成，保证数据一致性
     */
    groupList: (state) => {
      return Array.from(state._groupMap.values())
    },

    /**
     * @description: 根据群组ID获取群组信息
     */
    getGroupById: state => (groupId: string): IGroupInfo | undefined => {
      const group = state._groupMap.get(groupId)
      if (!group) {
        console.error('当前群组Map keys:', groupId)
      }
      return group
    },

    /**
     * @description: 根据群组ID获取群成员列表
     * @param {string} groupId - 群组ID
     * @returns {IGroupMember[]} 群成员列表
     */
    getMembersByGroupId: state => (groupId: string): IGroupMember[] => {
      const cache = state._memberMap.get(groupId)
      if (!cache)
        return []

      return cache.memberList
    },
  },

  actions: {
    reset() {
      this._groupMap = new Map()
      this._memberMap = new Map()
    },

    /**
     * @description: 获取群组列表
     */
    async initGroupListApi() {
      const getGroupApi = await getGroupListApi({
        page: 1,
        limit: 100,
      })
      if (getGroupApi.code === 0 && getGroupApi.result?.list?.length > 0) {
        // 直接更新Map，数组会自动生成
        this.convertGroupListToMap(getGroupApi.result.list)
      }
    },

    updateGroupInfo(groupId: string) {
      return getGroupInfoApi({ groupId }).then((res) => {
        if (res.code === 0) {
          const groupInfo = res.result

          // 获取现有的群组信息或创建新的
          const existingGroup = this._groupMap.get(groupId)
          const updatedGroup: IGroupInfo = {
            title: groupInfo.title || existingGroup?.title || '',
            name: existingGroup?.name || '',
            fileName: existingGroup?.fileName || '',
            memberCount: existingGroup?.memberCount || 0,
            conversationId: groupId,
            groupId: existingGroup?.groupId || '',
            ownerId: existingGroup?.ownerId || '',
            members: existingGroup?.members || [],
            notice: existingGroup?.notice || '',
            desc: existingGroup?.desc || '',
          }

          this._groupMap.set(groupId, updatedGroup)

          return res
        }
        return res
      }).catch((error) => {
        console.error('Failed to update group info:', error)
        throw error
      })
    },

    /**
     * @description: 将群组列表转换为Map形式
     */
    convertGroupListToMap(groupList: IGroupInfo[]) {
      const groupMap = new Map()
      groupList?.forEach((group: IGroupInfo) => {
        groupMap.set(group.conversationId, group)
      })
      this._groupMap = groupMap
    },

    /**
     * @description: 获取群成员列表
     * @param {string} groupId - 群组ID
     * @param {boolean} forceUpdate - 是否强制更新
     * @param {number} page - 页码，可选
     * @param {number} limit - 每页数量，可选
     */
    async getGroupMembersApi(groupId: string, forceUpdate = false, page?: number, limit?: number) {
      const cache = this._memberMap.get(groupId)
      const now = Date.now()

      if (cache && !forceUpdate && (now - cache.lastUpdateTime < 5 * 60 * 1000)) {
        return { code: 0, result: { list: this.getMembersByGroupId(groupId) } }
      }

      try {
        const res = await getGroupMembersApi({ groupId, page, limit })
        if (res.code === 0) {
          // 直接使用API返回的数据
          this._memberMap.set(groupId, {
            memberList: res.result.list,
            lastUpdateTime: now,
          })
        }
        return res
      }
      catch (error) {
        console.error('Failed to get group members:', error)
        throw error
      }
    },

    /**
     * @description: 添加群成员
     * @param {string} groupId - 群组ID
     * @param {IGroupMember[]} members - 要添加的成员列表
     */
    addMembers(groupId: string, members: IGroupMember[]) {
      const cache = this._memberMap.get(groupId)
      if (cache) {
        cache.memberList.push(...members)
        cache.lastUpdateTime = Date.now()
      }
    },

    /**
     * @description: 移除群成员
     * @param {string} groupId - 群组ID
     * @param {string[]} memberIds - 要移除的成员ID列表
     */
    removeMembers(groupId: string, memberIds: string[]) {
      const cache = this._memberMap.get(groupId)
      if (cache) {
        cache.memberList = cache.memberList.filter(member => !memberIds.includes(member.userId))
        cache.lastUpdateTime = Date.now()
      }
    },

    /**
     * @description: 移除群组
     * @param {string} groupId - 群组ID
     */
    removeGroup(groupId: string) {
      this._groupMap.delete(groupId)

      this._memberMap.delete(groupId)
    },
  },
})
