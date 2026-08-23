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

export const useMessageMediaStore = defineStore('useMessageMediaStore', {
  state: () => ({
    playedMessageIds: [] as string[],
    localOnlyPlayedIds: [] as string[],
  }),

  getters: {
    isPlayed: state => (messageId: string) => {
      if (!messageId)
        return false
      return state.playedMessageIds.includes(messageId)
        || state.localOnlyPlayedIds.includes(messageId)
    },
  },

  actions: {
    async init() {
      try {
        const result = await electron.database.chat.getMessageMediaIds()
        this.playedMessageIds = result.messageIds || []
      }
      catch (error) {
        console.error('[MessageMediaStore] 加载消息媒体状态失败:', error)
      }
    },

    mark(messageId: string, options?: { localOnly?: boolean }) {
      if (!messageId)
        return

      if (options?.localOnly) {
        if (!this.localOnlyPlayedIds.includes(messageId))
          this.localOnlyPlayedIds.push(messageId)
        return
      }

      if (!this.playedMessageIds.includes(messageId))
        this.playedMessageIds.push(messageId)
    },

    merge(messageIds: string[]) {
      if (!messageIds?.length)
        return

      const set = new Set(this.playedMessageIds)
      for (const id of messageIds) {
        if (id)
          set.add(id)
      }
      this.playedMessageIds = Array.from(set)
    },
  },
})
