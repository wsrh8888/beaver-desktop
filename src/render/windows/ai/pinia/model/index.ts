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

import type {
  AiModelSource,
  IAiCustomModel,
  IAiOfficialModel,
  IAiSelectedModel,
} from 'renderModule/windows/ai/types/model'
import { AI_MODEL_AUTO_ID } from 'renderModule/windows/ai/types/model'
import { defineStore } from 'pinia'
import Logger from 'renderModule/utils/logger'

const DEFAULT_SELECTED: IAiSelectedModel = { source: 'official', id: AI_MODEL_AUTO_ID }

const logger = new Logger('AiModelStore')

/**
 * 官方模型（含虚拟 Auto）+ 用户自定义模型。
 * 默认选中 official/auto；发消息传 modelId，agent 对 auto 自行选模。
 * 接口请求放页面里，这里只存状态。
 */
export const useAiModelStore = defineStore('useAiModelStore', {
  state: () => ({
    officialModels: [] as IAiOfficialModel[],
    customModels: [] as IAiCustomModel[],
    selected: { ...DEFAULT_SELECTED } as IAiSelectedModel,
  }),
  getters: {
    isAuto(): boolean {
      return this.selected.source === 'official' && this.selected.id === AI_MODEL_AUTO_ID
    },

    selectedModel(): IAiOfficialModel | IAiCustomModel | undefined {
      if (this.selected.source === 'official')
        return this.officialModels.find(m => m.id === this.selected.id)
      return this.customModels.find(m => m.id === this.selected.id)
    },
  },
  actions: {
    setOfficialModels(list: IAiOfficialModel[]) {
      this.officialModels = list
      this.ensureSelected()
    },

    setCustomModels(list: IAiCustomModel[]) {
      this.customModels = list
      this.ensureSelected()
    },

    addCustomModel(model: IAiCustomModel) {
      this.customModels.unshift(model)
    },

    removeCustomModel(id: string) {
      this.customModels = this.customModels.filter(m => m.id !== id)
      if (this.selected.source === 'custom' && this.selected.id === id)
        this.selected = { ...DEFAULT_SELECTED }
      this.ensureSelected()
    },

    selectModel(source: AiModelSource, id: string) {
      const exists = source === 'official'
        ? this.officialModels.some(m => m.id === id)
        : this.customModels.some(m => m.id === id)
      if (!exists) {
        logger.warn({ text: '选择不存在的模型', data: { source, id } })
        return
      }
      this.selected = { source, id }
    },

    ensureSelected() {
      const ok = this.selected.source === 'official'
        ? this.officialModels.some(m => m.id === this.selected.id)
        : this.customModels.some(m => m.id === this.selected.id)
      if (ok)
        return
      if (this.officialModels.some(m => m.id === AI_MODEL_AUTO_ID)) {
        this.selected = { ...DEFAULT_SELECTED }
        return
      }
      if (this.officialModels.length > 0) {
        this.selected = { source: 'official', id: this.officialModels[0].id }
        return
      }
      if (this.customModels.length > 0) {
        this.selected = { source: 'custom', id: this.customModels[0].id }
        return
      }
      logger.warn({ text: '无可选模型，发送可能失败', data: { official: this.officialModels.length, custom: this.customModels.length } })
    },
  },
})
