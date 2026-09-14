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

import type { IStoreDataMap } from 'commonModule/type/mainStore'
import type { IStorageModule } from 'commonModule/type/preload/storage'
import type { IUserInfo } from 'commonModule/type/store/userInfo'
import { defineStore } from 'pinia'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('MomentUserStore')

/**
 * @description: 当前用户信息管理
 */
export const useUserStore = defineStore('useUserStore', {
  state: (): {
    currentUserId: string
    users: Map<string, IUserInfo>
    version: number
  } => ({
    currentUserId: '',
    users: new Map(),
    version: 0,
  }),

  getters: {
    getUserId: state => state.currentUserId,
    /**
     * @description 获取用户的基础信息
     */
    getContact: state => (userId: string): IUserInfo => {
      return state.users.get(userId) || {
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
    async init() {
      const storage = electron.storage as IStorageModule
      // 当前用户
      const stored = await storage.getAsync('userInfo')
      this.currentUserId = stored?.userId || ''

      // 所有用户快照（allUser）：object map
      const allUserSnapshot = await electron.storage.getAsync('allUser')
      if (allUserSnapshot && typeof allUserSnapshot === 'object') {
        Object.values(allUserSnapshot as Record<string, any>).forEach((u) => {
          if (u?.userId) {
            this.users.set(u.userId, {
              userId: u.userId,
              nickName: u.nickName || u.userId,
              avatar: u.avatar || '',
              abstract: u.abstract || '',
              phone: u.phone || '',
              email: u.email || '',
              gender: u.gender || 0,
              version: u.version || 0,
            })
          }
        })
      }
      this.version++
      logger.info({ text: '朋友圈用户数据初始化完成', data: { userCount: this.users.size, hasCurrentUser: !!this.currentUserId } })
    },
  },
})
