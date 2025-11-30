import type { IMomentInfo } from 'commonModule/type/ajax/moment'
import { defineStore } from 'pinia'
import { getMomentListApi, likeMomentApi } from 'renderModule/api/moment'

/**
 * @description: 朋友圈状态管理
 */
export const useMomentStore = defineStore('useMomentStore', {
  state: () => ({
    /**
     * @description: 动态列表
     */
    momentList: [] as IMomentInfo[],

    /**
     * @description: 当前页码
     */
    currentPage: 1,

    /**
     * @description: 当前选中的动态ID（用于详情页面）
     */
    currentMomentId: '' as string
  }),

  getters: {
  },

  actions: {
    /**
     * @description: 加载动态列表
     */
    async loadMoments(page: number = 1) {
      const response = await getMomentListApi({
        page,
        limit: 50
      })

      if (page === 1) {
        this.momentList = response.result.list
      } else {
        this.momentList.push(...response.result.list)
      }
      console.log(this.momentList)

    },

    /**
     * @description: 刷新动态
     */
    async refreshMoments() {
      this.currentPage = 1
      await this.loadMoments(1)
    },

    /**
     * @description: 加载更多动态
     */
    async loadMoreMoments() {
      await this.loadMoments(this.currentPage + 1)

    },

    /**
     * @description: 点赞和取消点赞
     */
    async toggleLike(momentId: string, type: 'like' | 'unlike') {
      await likeMomentApi({
        momentId,
        status: type === 'like'
      })
      // 更新本地状态
      const moment = this.momentList.find(m => m.id === momentId)
      if (moment) {
        if (type === 'like') {
          moment.likes = moment.likes || []
          moment.likes.push({ userId: '', userName: '', nickName: '' }) // 这里需要根据实际用户信息填充
          moment.isLiked = true
        } else {
          moment.likes = moment.likes?.filter(like => like.userId !== '') || []
          moment.isLiked = false
        }
        moment.likeCount = moment.likes.length
      }
    },

    /**
     * @description: 显示动态详情
     */
    showMomentDetail(momentId: string) {
      this.currentMomentId = momentId
    },

    /**
     * @description: 隐藏动态详情
     */
    hideMomentDetail() {
      this.currentMomentId = ''
    },

    /**
     * @description: 获取当前选中的动态
     */
    getCurrentMoment() {
      return this.momentList.find(m => m.id === this.currentMomentId)
    },

  },
})
