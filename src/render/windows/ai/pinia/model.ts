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
import type { AiSettingsSection, IAiModel } from 'renderModule/windows/ai/types/model'

/**
 * 模型与设置弹窗状态。
 * 弹窗显隐 + 模型列表 + 当前选中的左侧分类（先只 'model'）。
 */
export const useAiModelStore = defineStore('useAiModelStore', {
  state: () => ({
    models: [] as IAiModel[],
    settingsVisible: false,
    activeSection: 'model' as AiSettingsSection,
  }),
  actions: {
    createId() {
      return `model_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    },

    addModel(data: Omit<IAiModel, 'id'>) {
      this.models.push({ id: this.createId(), ...data })
    },

    removeModel(id: string) {
      const idx = this.models.findIndex(m => m.id === id)
      if (idx >= 0)
        this.models.splice(idx, 1)
    },

    openSettings(section: AiSettingsSection = 'model') {
      this.activeSection = section
      this.settingsVisible = true
    },

    closeSettings() {
      this.settingsVisible = false
    },
  },
})
