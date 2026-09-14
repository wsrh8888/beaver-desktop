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
import Logger from 'renderModule/utils/logger';
const logger = new Logger('circle')


export interface ICircleInfo {
  circleId: string
  conversationId: string
  name: string
  avatar: string
  version?: number
}

/**
 * @description: 主窗会话用的圈子资料（本地库），与圈子独立窗口 store 分离
 */
export const useCircleStore = defineStore('circleStore', {
  state: (): {
    _circleList: ICircleInfo[]
  } => ({
    _circleList: [],
  }),

  getters: {
    getCircleList: (state) => {
      return state._circleList
    },
    getCircleById: state => (conversationId: string): ICircleInfo | undefined => {
      return state._circleList.find(circle => circle.conversationId === conversationId)
    },
  },

  actions: {
    reset() {
    logger.info({ text: 'reset 开始' })
      this._circleList = []
    },

    async init() {
    logger.info({ text: 'init 开始' })
      const result = await electron.database.circle.getCircleList()
      this._circleList = (result?.list || []).map(item => ({
        circleId: item.circleId,
        conversationId: `circle_${item.circleId}`,
        name: item.name,
        avatar: item.avatar || '',
        version: (item as any).version,
      }))
    },

    upsertCircle(circleData: ICircleInfo) {
    logger.info({ text: 'upsertCircle 开始' })
      const index = this._circleList.findIndex(c => c.conversationId === circleData.conversationId)
      if (index !== -1) {
        this._circleList[index] = { ...this._circleList[index], ...circleData }
      }
      else {
        this._circleList.push(circleData)
      }
    },

    /**
     * 按圈子 id 从本地库刷新资料
     */
    async updateCirclesByIds(circleIds: string[]) {
    logger.info({ text: 'updateCirclesByIds 开始' })
      if (!circleIds.length)
        return
      await this.init()
    },

    /**
     * 按会话 id 从本地库刷新圈子资料（圈 id 或 circle_ 前缀均可）
     */
    async updateCirclesByConversationIds(conversationIds: string[]) {
    logger.info({ text: 'updateCirclesByConversationIds 开始' })
      const circleIds = conversationIds
        .filter(id => id.startsWith('circle_'))
        .map(id => id.slice('circle_'.length))
      if (!circleIds.length)
        return

      await this.updateCirclesByIds(circleIds)
    },

    removeCircle(circleIdOrConversationId: string) {
    logger.info({ text: 'removeCircle 开始' })
      const conversationId = circleIdOrConversationId.startsWith('circle_')
        ? circleIdOrConversationId
        : `circle_${circleIdOrConversationId}`
      this._circleList = this._circleList.filter(circle => circle.conversationId !== conversationId)
    },
  },
})
