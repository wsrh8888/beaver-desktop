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

import type { ICircleListItem } from 'commonModule/type/ajax/circle'
import { defineStore } from 'pinia'
import { getMyCircleListApi } from 'renderModule/api/circle'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('CircleWindowStore')

function parseCircleId(conversationId: string) {
  if (!conversationId.startsWith('circle_'))
    return conversationId
  return conversationId.slice('circle_'.length)
}

/**
 * 圈子独立窗口用：仅缓存「我的圈子」列表（HTTP）。
 * 主窗会话列表请用 app/pinia/circle，不要混用。
 */
export const useCircleStore = defineStore('useCircleWindowStore', {
  state: () => ({
    myCircles: [] as ICircleListItem[],
  }),
  actions: {
    parseCircleId,
    async loadMyCircles() {
      logger.info({ text: '开始加载我的圈子列表', data: { page: 1, limit: 100 } })

      try {
        const res = await getMyCircleListApi({ page: 1, limit: 100 })
        if (res.code !== 0) {
          logger.error({ text: '加载我的圈子列表失败', data: { code: res.code, msg: res.msg } })
          return
        }
        this.myCircles = res.result.list || []
        logger.info({ text: '加载我的圈子列表成功', data: { count: this.myCircles.length } })
      }
      catch (error) {
        logger.error({ text: '加载我的圈子列表异常', data: { error } })
      }
    },
  },
})

export { parseCircleId }
