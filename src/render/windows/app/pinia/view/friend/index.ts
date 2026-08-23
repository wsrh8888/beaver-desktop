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
 * @description: 好友视图状态管理
 */
export const useFriendViewStore = defineStore('useFriendViewStore', {
  state: () => ({
    /**
     * @description: 当前选中的项目ID
     */
    selectedId: null as string | null,
    /**
     * @description: 当前选中的类型（friend 或 group）
     */
    selectedType: null as 'friend' | 'group' | 'friend-notification' | 'group-notification' | null,
    /**
     * @description: 当前选中的标签页（friends 或 groups）
     */
    currentTab: 'friends' as string,
    /**
     * @description: 当前显示的弹窗类型
     */
    currentDialog: null as string | null,
  }),

  actions: {
    /**
     * @description: 设置当前选中的项目（包含类型）
     */
    setSelectedConversationWithType(id: string, type: 'friend' | 'group' | 'friend-notification' | 'group-notification') {
      this.selectedId = id
      this.selectedType = type
    },

    /**
     * @description: 设置当前标签页
     */
    setCurrentTab(tab: string) {
      this.currentTab = tab
    },

    /**
     * @description: 显示/隐藏弹窗
     */
    showDialog(dialogType: string | null) {
      this.currentDialog = dialogType
    },
  },
})
