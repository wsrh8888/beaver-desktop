/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
