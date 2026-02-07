import { defineStore } from 'pinia'

export interface IIncomingInfo {
  roomId: string
  callType: 'private' | 'group'
  callerId: string
  conversationId: string
  callMode: 'audio' | 'video'
}

/**
 * @description: 来电提示窗口 Store
 */
export const useIncomingStore = defineStore('useIncomingStore', {
  state: () => ({
    callInfo: {
      roomId: '',
      callType: 'private' as 'private' | 'group',
      callerId: '',
      conversationId: '',
      callMode: 'audio' as 'audio' | 'video',
      hasActiveCall: false, // 是否有正在进行的通话
      activeCallRoomId: '' // 正在进行的通话ID
    },
    callerInfo: {
      name: '',
      avatar: ''
    }
  }),

  actions: {
    setCallInfo(info: Partial<IIncomingInfo & { hasActiveCall?: boolean; activeCallRoomId?: string }>) {
      Object.assign(this.callInfo, info)
    },

    setCallerInfo(info: { name?: string; avatar?: string }) {
      if (info.name) this.callerInfo.name = info.name
      if (info.avatar) this.callerInfo.avatar = info.avatar
    },

    reset() {
      this.callInfo = {
        roomId: '',
        callType: 'private',
        callerId: '',
        conversationId: '',
        callMode: 'audio',
        hasActiveCall: false,
        activeCallRoomId: ''
      }
      this.callerInfo = {
        name: '',
        avatar: ''
      }
    }
  }
})
