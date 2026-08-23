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
 * @description: 验证窗口状态管理
 */
export const useVerifyStore = defineStore('verifyStore', {
  /**
   * @description: 验证状态
   */
  state: () => ({
    searchData: {
      type: '' as 'friend' | 'group',
      id: '',
      title: '',
      avatar: '',
      conversationId: '',
      source: '',
    },
    verifyType: '',
  }),

  /**
   * @description: 状态计算属性
   */
  getters: {

  },

  /**
   * @description: 状态修改方法
   */
  actions: {
    updateSearchData(data: {
      type: 'friend' | 'group'
      id: string
      title: string
      avatar: string
      source: string
      conversationId: string
    }, verifyType: string) {
      this.searchData = data
      this.verifyType = verifyType
    },
  },
})
