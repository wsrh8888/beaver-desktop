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

export type AiWorkMode = 'office' | 'code' | 'design'
export type AiResultTab = 'artifact' | 'files' | 'changes' | 'preview'
export type AiSkillTab = 'plaza' | 'mine'

export const useAiViewStore = defineStore('useAiViewStore', {
  state: () => ({
    workMode: 'office' as AiWorkMode,
    sidebarCollapsed: false,
    resultPanelOpen: true,
    resultTab: 'artifact' as AiResultTab,
    skillTab: 'plaza' as AiSkillTab,
    /** 每次点「新建任务」递增，用于同路由下重置欢迎页输入 */
    composeEpoch: 0,
  }),
  actions: {
    setWorkMode(mode: AiWorkMode) {
      this.workMode = mode
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    toggleResultPanel() {
      this.resultPanelOpen = !this.resultPanelOpen
    },
    setResultTab(tab: AiResultTab) {
      this.resultTab = tab
    },
    setSkillTab(tab: AiSkillTab) {
      this.skillTab = tab
    },
    bumpComposeEpoch() {
      this.composeEpoch += 1
    },
  },
})
