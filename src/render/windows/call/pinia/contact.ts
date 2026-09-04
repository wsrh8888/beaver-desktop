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
import Logger from 'renderModule/utils/logger'

const logger = new Logger('CallContactStore')

export const useContactStore = defineStore('useContactStore', {
  state: (): {
    user: Map<string, IUserInfo>
    version: number // 用于触发响应式更新
  } => ({
    user: new Map(),
    version: 0,
  }),

  getters: {
    getContact: state => (userId: string): IUserInfo => {
      return state.user.get(userId) || {
        userId: '',
        nickName: '',
        avatar: '',
        abstract: '',
        phone: '',
        email: '',
        gender: 0,
        version: 0,
      }
    },
  },

  actions: {
    updateContact(userId: string, contactInfo: Partial<IUserInfo>, force: boolean = false) {
      const existing = this.user.get(userId)
      let updated = false

      if (existing) {
        // 如果强制更新或新版本号大于等于现有版本号，则更新
        if (force || !contactInfo.version || contactInfo.version >= existing.version) {
          this.user.set(userId, {
            ...existing,
            ...contactInfo,
          })
          updated = true
        }
        // 如果版本号较低且不强制更新，则跳过更新
      }
      else {
        // 如果不存在，创建新的（需要完整信息）
        this.user.set(userId, contactInfo as IUserInfo)
        updated = true
      }

      // 如果有更新，递增version触发响应式更新
      if (updated) {
        this.version++
      }
    },

    /**
     * @description: 根据用户ID列表批量更新联系人信息
     */
    async updateContactsByIds(userIds: string[]) {
      if (userIds.length === 0) {
        return
      }

      try {
        const result = await electron.database.user.getUsersBasicInfo({ userIds })

        // 更新contact store
        result.users.forEach((user) => {
          this.updateContact(user.userId, {
            userId: user.userId,
            nickName: user.nickName,
            avatar: user.avatar || '',
            abstract: user.abstract || '',
            phone: user.phone || '',
            email: user.email || '',
            gender: user.gender || 0,
            version: user.version || 0,
          })
        })

        return result
      }
      catch (error) {
        logger.error({ text: '批量更新联系人信息失败', data: { error: (error as Error)?.message } })
        throw error
      }
    },
  },
})
