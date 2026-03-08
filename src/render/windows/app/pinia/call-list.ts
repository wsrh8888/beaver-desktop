import { defineStore } from 'pinia'

export interface ICallItem {
  roomId: string
  callType: 'private' | 'group'
  callerId: string
  conversationId: string
  callerName?: string
  callerAvatar?: string
  status: 'incoming' | 'calling' | 'active' // incoming=来电, calling=呼叫中, active=通话中
  timestamp: number
}

/**
 * @description: 通话列表管理 Store - 管理所有进行中的通话和来电
 */
export const useCallListStore = defineStore('useCallListStore', {
  state: () => ({
    // 通话列表
    calls: [] as ICallItem[]
  }),

  getters: {
    // 获取来电列表
    incomingCalls: (state) => state.calls.filter(c => c.status === 'incoming'),

    // 获取正在进行的通话列表
    activeCalls: (state) => state.calls.filter(c => c.status === 'active' || c.status === 'calling'),

    // 是否有来电
    hasIncoming: (state) => state.calls.some(c => c.status === 'incoming'),

    // 通话总数
    totalCount: (state) => state.calls.length
  },

  actions: {
    /**
     * 添加来电
     */
    addIncomingCall(call: Omit<ICallItem, 'status'>) {
      // 检查是否已存在
      const exists = this.calls.find(c => c.roomId === call.roomId)
      if (exists) return

      this.calls.push({
        ...call,
        status: 'incoming'
      })
    },

    /**
     * 更新通话状态
     */
    updateCallStatus(roomId: string, status: ICallItem['status']) {
      const call = this.calls.find(c => c.roomId === roomId)
      if (call) {
        call.status = status
      }
    },

    /**
     * 更新来电者信息（从数据库加载后更新）
     */
    updateCallerInfo(roomId: string, info: { name?: string; avatar?: string }) {
      const call = this.calls.find(c => c.roomId === roomId)
      if (call) {
        if (info.name) call.callerName = info.name
        if (info.avatar) call.callerAvatar = info.avatar
      }
    },

    /**
     * 移除通话
     */
    removeCall(roomId: string) {
      const index = this.calls.findIndex(c => c.roomId === roomId)
      if (index !== -1) {
        this.calls.splice(index, 1)
      }
    },

    /**
     * 清空所有
     */
    clearAll() {
      this.calls = []
    }
  }
})
