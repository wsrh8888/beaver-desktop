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
