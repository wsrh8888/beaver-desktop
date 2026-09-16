/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { defineStore } from 'pinia'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('circle')

export interface ICircleInfo {
  circleId: string
  conversationId: string
  name: string
  avatar: string
  version?: number
}

/**
 * 主窗会话列表用的圈子资料（本地库）。
 * 圈子独立窗口有自己的 store，勿混用。
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

    async updateCirclesByIds(circleIds: string[]) {
      logger.info({ text: 'updateCirclesByIds 开始' })
      if (!circleIds.length)
        return
      await this.init()
    },

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
