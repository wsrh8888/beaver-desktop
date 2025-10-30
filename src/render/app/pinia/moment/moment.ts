import type { IMomentModel } from 'renderModule/types/store/moment'
import { defineStore } from 'pinia'
import { getMomentInfoApi, getMomentsListApi } from 'renderModule/api/moment'

/**
 * @description: 朋友圈管理
 */
export const useMomentStore = defineStore('momentStore', {
  state: (): {
    momentList: IMomentModel[]
    momentMapInfo: Map<string, IMomentModel>
  } => ({
    /**
     * @description: 动态列表
     */
    momentList: [],
    /**
     * @description: 动态信息映射
     */
    momentMapInfo: new Map<string, IMomentModel>(),
  }),
  getters: {
    /**
     * @description: 根据ID获取动态信息
     * @param {string} id - 动态id
     * @returns {IMomentModel} 返回动态信息
     */
    getMomentInfoById: (state) => {
      return (id: string): IMomentModel | undefined => {
        return state.momentMapInfo.get(id)
      }
    },
  },
  actions: {
    reset() {
      this.momentList = []
      this.momentMapInfo.clear()
    },

    async updateMomentInfo(momentId: string) {
      try {
        const res = await getMomentInfoApi({ momentId })
        if (res.code === 0) {
          const momentInfo = res.result.moment
          const index = this.momentList.findIndex(
            item => item.id.toString() === momentId,
          )

          if (index !== -1) {
            this.momentList[index] = momentInfo
          }
          else {
            this.momentList.push(momentInfo)
          }

          // 更新动态信息映射
          this.momentMapInfo.set(momentId, momentInfo)
          return momentInfo
        }
      }
      catch (error) {
        console.error('更新朋友圈信息失败:', error)
        throw error
      }
    },

    async initMomentApi() {
      try {
        const res = await getMomentsListApi({
          page: 1,
          limit: 1000,
        })
        if (res.code === 0) {
          // 直接使用API返回的数据
          this.momentList = res.result.list || []

          // 初始化动态信息映射
          this.momentList.forEach((moment) => {
            this.momentMapInfo.set(moment.id.toString(), moment)
          })
        }
      }
      catch (error) {
        console.error('初始化朋友圈列表失败:', error)
        throw error
      }
    },
  },
})
