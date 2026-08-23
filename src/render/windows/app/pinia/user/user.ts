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

import type { IUserInfo } from 'commonModule/type/store/userInfo'
import { defineStore } from 'pinia'
import { updateInfoApi } from 'renderModule/api/user'
import { useContactStore } from '../contact/contact'

/**
 * @description: 当前用户信息管理
 */
export const useUserStore = defineStore('useUserStore', {
  state: (): {
    currentUserId: string
  } => ({
    currentUserId: '',
  }),

  getters: {
    getUserInfo: (state) => {
      const contactStore = useContactStore()
      // 直接从contactStore获取当前用户的信息
      return contactStore.getContact(state.currentUserId)
    },
    getUserId: (state) => {
      return state.currentUserId
    },
  },

  actions: {
    async init() {
      const storeUserId = await electron.storage.getAsync('userInfo')
      if (storeUserId) {
        this.currentUserId = storeUserId.userId!
      }
    },

    async updateUserInfo(updates: Partial<IUserInfo>): Promise<boolean> {
      const res = await updateInfoApi(updates)
      if (res.code === 0) {
        // 直接更新到contactStore（用户主动更新，强制更新）
        const contactStore = useContactStore()
        if (Object.keys(updates).length > 0) {
          contactStore.updateContact(this.currentUserId, updates, true)
        }

        return true
      }
      return false
    },

    reset() {
      this.currentUserId = ''
    },
  },
})
