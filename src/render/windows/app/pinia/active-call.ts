import { defineStore } from 'pinia'

/**
 * @description: 当前活跃通话状态管理
 * 用于判断用户是否正在通话中，以及管理 call-incoming 的弹窗状态
 */
export const useActiveCallStore = defineStore('useActiveCallStore', {
  state: () => ({
    // 当前是否在通话中
    isInCall: false,
    // 当前通话的 roomId
    currentRoomId: '',
    // 当前是否有 call-incoming 弹窗
    hasIncomingPopup: false,
    // 当前 call-incoming 弹窗的 roomId
    incomingPopupRoomId: ''
  }),

  getters: {
    // 是否可以接听新来电（不在通话中且没有弹窗）
    canAcceptNewCall: (state) => !state.isInCall && !state.hasIncomingPopup
  },

  actions: {
    /**
     * 设置进入通话状态
     */
    enterCall(roomId: string) {
      this.isInCall = true
      this.currentRoomId = roomId
    },

    /**
     * 设置离开通话状态
     */
    leaveCall() {
      this.isInCall = false
      this.currentRoomId = ''
    },

    /**
     * 设置 call-incoming 弹窗状态
     */
    setIncomingPopup(hasPopup: boolean, roomId: string = '') {
      this.hasIncomingPopup = hasPopup
      this.incomingPopupRoomId = roomId
    },

    /**
     * 重置所有状态
     */
    reset() {
      this.isInCall = false
      this.currentRoomId = ''
      this.hasIncomingPopup = false
      this.incomingPopupRoomId = ''
    }
  }
})
