import type { IGroupMember } from 'commonModule/type/ajax/group'
import { defineStore } from 'pinia'

/**
 * @description: 群成员信息管理
 */
export const useGroupMemberStore = defineStore('groupMemberStore', {
  state: (): {
    /**
     * @description: 群成员Map，key为groupId（不是conversationId），value为成员列表
     */
    memberMap: Map<string, IGroupMember[]>
  } => ({
    memberMap: new Map(),
  }),

  getters: {
    /**
     * @description: 根据群组ID获取群成员列表
     * @param {string} groupId - 群组ID（不是conversationId）
     */
    getMembersByGroupId: state => (groupId: string): IGroupMember[] => {
      return state.memberMap.get(groupId) || []
    },

    /**
     * @description: 根据用户ID获取群成员信息（在所有群中查找）
     * @param {string} userId - 用户ID
     * @returns {IGroupMember | null} 返回群成员信息，如果未找到则返回null
     */
    getMemberByUserId: state => (userId: string): IGroupMember | null => {
      for (const members of state.memberMap.values()) {
        const member = members.find(m => m.userId === userId)
        if (member) {
          return member
        }
      }
      return null
    },
  },

  actions: {
    /**
     * @description: 重置所有成员数据
     */
    reset() {
      this.memberMap.clear()
    },

    /**
     * @description: 初始化群成员列表（从数据库获取）
     * @param {string} groupId - 群组ID（不是conversationId）
     */
    async init(groupId: string) {
      // 如果已经加载过，直接返回
      if (this.memberMap.has(groupId)) {
        return
      }

      try {
        const result = await electron.database.group.getGroupMembers({ groupId })
        console.error('cxcxcxcsd11111111111111111111f', result)
        if (result?.list) {
          this.memberMap.set(groupId, result.list)
        }
      }
      catch (error) {
        console.error('Failed to init group members:', error)
      }
    },

    /**
     * @description: 添加群成员
     * @param {string} groupId - 群组ID
     * @param {IGroupMember[]} members - 要添加的成员列表
     */
    addMembers(groupId: string, members: IGroupMember[]) {
      const existing = this.memberMap.get(groupId) || []
      this.memberMap.set(groupId, [...existing, ...members])
    },

    /**
     * @description: 根据群组ID列表批量更新群成员信息
     */
    async updateMembersByGroupIds(groupIds: string[]) {
      if (groupIds.length === 0) {
        return
      }

      try {
        // 使用批量API一次性获取所有群组的成员信息
        const result = await electron.database.group.getGroupMembersBatch({ groupIds })

        // 清除旧的缓存并设置新的成员数据
        for (const groupId of groupIds) {
          this.memberMap.delete(groupId)
        }

        // 按群组ID分组设置成员数据
        const membersByGroup = new Map<string, any[]>()
        for (const member of result.list) {
          const groupId = (member as any).groupId
          if (!membersByGroup.has(groupId)) {
            membersByGroup.set(groupId, [])
          }
          membersByGroup.get(groupId)!.push(member)
        }

        // 设置新的成员数据
        for (const [groupId, members] of membersByGroup) {
          this.memberMap.set(groupId, members)
        }

        return groupIds
      } catch (error) {
        console.error('批量更新群成员信息失败:', error)
        throw error
      }
    },

    /**
     * @description: 移除群成员
     * @param {string} groupId - 群组ID
     * @param {string[]} memberIds - 要移除的成员ID列表
     */
    removeMembers(groupId: string, memberIds: string[]) {
      const existing = this.memberMap.get(groupId) || []
      this.memberMap.set(groupId, existing.filter(member => !memberIds.includes(member.userId)))
    },
  },
})
