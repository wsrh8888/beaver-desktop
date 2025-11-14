import type { IGroupMember } from 'commonModule/type/ajax/group'
import { defineStore } from 'pinia'
import { getGroupMembersApi } from 'renderModule/api/group'

interface IMemberCache {
  memberList: IGroupMember[]
  lastUpdateTime: number
}

/**
 * @description: 群成员信息管理
 */
export const useGroupMemberStore = defineStore('groupMemberStore', {
  state: (): {
    _memberMap: Map<string, IMemberCache>
  } => ({
    /**
     * @description: 群成员Map，key为群组ID
     */
    _memberMap: new Map(),
  }),

  getters: {
    /**
     * @description: 根据群组ID获取群成员列表
     */
    getMembersByGroupId: state => (groupId: string): IGroupMember[] => {
      const cache = state._memberMap.get(groupId)
      return cache?.memberList || []
    },
  },

  actions: {
    /**
     * @description: 重置所有成员数据
     */
    reset() {
      this._memberMap = new Map()
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
     * @description: 更新群成员信息
     * @param {string} groupId - 群组ID
     * @param {string} memberId - 成员ID
     * @param {Partial<IGroupMember>} updates - 更新内容
     */
    updateMember(groupId: string, memberId: string, updates: Partial<IGroupMember>) {
      const cache = this._memberMap.get(groupId)
      if (cache) {
        const memberIndex = cache.memberList.findIndex(member => member.userId === memberId)
        if (memberIndex !== -1) {
          cache.memberList[memberIndex] = { ...cache.memberList[memberIndex], ...updates }
          cache.lastUpdateTime = Date.now()
        }
      }
    },

    /**
     * @description: 批量更新成员角色
     * @param {string} groupId - 群组ID
     * @param {Array<{userId: string, role: string}>} roleUpdates - 角色更新列表
     */
    updateMemberRoles(groupId: string, roleUpdates: Array<{ userId: string, role: string }>) {
      const cache = this._memberMap.get(groupId)
      if (cache) {
        roleUpdates.forEach((update) => {
          const member = cache.memberList.find(m => m.userId === update.userId)
          if (member) {
            member.role = update.role
          }
        })
        cache.lastUpdateTime = Date.now()
      }
    },
  },
})
