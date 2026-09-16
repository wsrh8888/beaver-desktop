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
