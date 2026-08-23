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

export const useGroupAssistantViewStore = defineStore('useGroupAssistantViewStore', {
  state: () => ({
    visible: false,
    groupId: '',
    /** 有值则进入对应类型详情，无值则走添加流程 */
    groupBotId: "",
    /** 群助手集成类型：custom / gitlab / jenkins 等，对应服务端 type 字段 */
    groupBotType: '',
    /** 列表脏标记，保存后递增以刷新群助手列表 */
    listVersion: 0,
  }),
  getters: {
    // 当前模式是创建还是编辑
    getCurrentMode: (state) => {
      if (state.groupBotId) {
        return 'edit'
      } else {
        return 'create'
      }
    },
  },

  actions: {
    close() {
      this.visible = false
      this.groupId = ''
      this.groupBotId = ''
      this.groupBotType = ''
    },
    markListDirty() {
      this.listVersion += 1
    },
  },
})
