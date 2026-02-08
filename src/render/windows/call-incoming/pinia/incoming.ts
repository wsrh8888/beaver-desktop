import { defineStore } from 'pinia'

export interface IIncomingInfo {
  roomInfo: {
    roomId: string
  }
  callType: 'private' | 'group'
  callerId: string
  conversationId: string
  callMode: 'audio' | 'video'
  role: 'caller' | 'callee'
  autoAccept: boolean
  type: string
}

/**
 * @description: 来电提示窗口 Store
 */
export const useIncomingStore = defineStore('useIncomingStore', {
  state: () => ({
    callInfo: {
      roomInfo: {
        roomId: '',
      },
      callType: 'private' as 'private' | 'group',
      callerId: '',
      conversationId: '',
      callMode: 'audio' as 'audio' | 'video',
      role: 'callee' as 'caller' | 'callee',
      autoAccept: false,
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
        roomInfo: {
          roomId: '',
        },
        callType: 'private',
        callerId: '',
        conversationId: '',
        callMode: 'audio',
        role: 'callee',
        autoAccept: false,
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
