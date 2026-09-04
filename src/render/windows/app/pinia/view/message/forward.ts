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

import type { IGetForwardDetailsRes } from 'commonModule/type/ajax/chat'
import { defineStore } from 'pinia'
import Logger from 'renderModule/utils/logger'
import { getForwardDetailsApi } from 'renderModule/api/chat'

const logger = new Logger('ForwardViewStore')

/**
 * @description: 转发消息查看视图状态
 */
export const useForwardViewStore = defineStore('useForwardViewStore', {
  state: () => ({
    visible: false,
    activeId: '', // 当前显示的详情RecordId
    forwardData: new Map<string, IGetForwardDetailsRes>(), // 记录缓存
  }),

  actions: {
    async open(id: string) {
      if (!id) return
      this.activeId = id
      this.visible = true

      if (!this.forwardData.has(id)) {
        try {
          const res = await getForwardDetailsApi({ recordId: id })
          this.forwardData.set(id, res.result)
        } catch (error) {
          logger.error({ text: '加载合并转发详情失败', data: { recordId: id, error: (error as Error)?.message } })
        }
      }
    },

    close() {
      this.visible = false
      this.activeId = ''
    }
  },
})
