import { defineStore } from 'pinia'

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
      this._circleList = []
    },

    async init() {
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
      if (!circleIds.length)
        return
      await this.init()
    },

    /**
     * 按会话 id 从本地库刷新圈子资料（圈 id 或 circle_ 前缀均可）
     */
    async updateCirclesByConversationIds(conversationIds: string[]) {
      const circleIds = conversationIds
        .filter(id => id.startsWith('circle_'))
        .map(id => id.slice('circle_'.length))
      if (!circleIds.length)
        return

      await this.updateCirclesByIds(circleIds)
    },

    removeCircle(circleIdOrConversationId: string) {
      const conversationId = circleIdOrConversationId.startsWith('circle_')
        ? circleIdOrConversationId
        : `circle_${circleIdOrConversationId}`
      this._circleList = this._circleList.filter(circle => circle.conversationId !== conversationId)
    },
  },
})
