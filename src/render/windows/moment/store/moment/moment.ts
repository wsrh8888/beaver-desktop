import type { IMomentCommentModel, IMomentInfo } from 'commonModule/type/ajax/moment'
import { defineStore } from 'pinia'
import {
  createMomentCommentApi,
  getMomentChildCommentsApi,
  getMomentDetailApi,
  getMomentLikesApi,
  getMomentListApi,
  getMomentRootCommentsApi,
  likeMomentApi,
} from 'renderModule/api/moment'
import { useUserStore } from '../user/user'

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
    currentMomentId: '' as string,
    /**
     * @description: 当前详情数据（不污染列表预览）
     */
    currentMomentDetail: null as IMomentInfo | null,
  }),

  getters: {
  },

  actions: {
    /**
     * @description: 添加新动态到列表开头
     */
    addNewMoment(moment: IMomentInfo) {
      this.momentList.unshift(moment)
    },

    /**
     * @description: 加载动态列表
     */
    async loadMoments(page: number = 1) {
      const response = await getMomentListApi({
        page,
        limit: 50,
      })

      if (page === 1) {
        this.momentList = response.result.list
      }
      else {
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
    async toggleLike(momentId: string) {
      const userStore = useUserStore()
      // 取当前状态（优先详情，其次列表）
      const detail = this.currentMomentDetail && this.currentMomentDetail.id === momentId ? this.currentMomentDetail : undefined
      const listItem = this.momentList.find(m => m.id === momentId)
      const currentLiked = detail?.isLiked ?? listItem?.isLiked ?? false
      const nextStatus = !currentLiked

      await likeMomentApi({
        momentId,
        status: nextStatus,
      })

      const applyLikeChange = (target?: IMomentInfo) => {
        if (!target)
          return
        const userId = userStore.getUserId
        const existed = (target.likes || []).some(like => like.userId === userId)
        if (nextStatus) {
          if (!existed) {
            const me = userStore.getContact(userStore.getUserId)
            const myName = me.nickName || me.userId || ''
            const myAvatar = me.avatar || ''
            target.likes = [
              {
                id: '',
                momentId,
                userId,
                createdAt: new Date().toISOString(),
                userName: myName,
                avatar: myAvatar,
              },
              ...(target.likes || []),
            ]
            target.likeCount = (target.likeCount || 0) + 1
          }
          target.isLiked = true
        }
        else {
          if (existed) {
            target.likes = (target.likes || []).filter(like => like.userId !== userId)
            target.likeCount = Math.max((target.likeCount || 0) - 1, 0)
          }
          target.isLiked = false
        }
      }

      applyLikeChange(this.momentList.find(m => m.id === momentId))
      if (this.currentMomentDetail && this.currentMomentDetail.id === momentId) {
        applyLikeChange(this.currentMomentDetail)
      }
    },

    /**
     * @description: 发表评论
     */
    async addComment(momentId: string, content: string, targetComment?: IMomentCommentModel) {
      // 计算 parentId 与 replyToCommentId（两层：parentId 指向顶层）
      let parentId = ''
      let replyToCommentId = ''
      if (targetComment) {
        replyToCommentId = targetComment.id
        parentId = targetComment.parentId || targetComment.id
      }
      const res = await createMomentCommentApi({
        momentId,
        content,
        parentId,
        replyToCommentId,
      })

      // 更新详情数据（仅当前详情，不污染列表）
      if (this.currentMomentDetail && this.currentMomentDetail.id === momentId) {
        const target = this.currentMomentDetail
        const newComment: IMomentCommentModel = {
          id: res.result.id,
          momentId,
          userId: res.result.userId,
          userName: res.result.userName || '',
          avatar: res.result.avatar || '',
          content: res.result.content,
          parentId: res.result.parentId,
          replyToCommentId: res.result.replyToCommentId,
          replyToUserName: res.result.replyToUserName,
          createdAt: res.result.createdAt,
        }
        if (!target.comments)
          target.comments = []
        if (!newComment.parentId) {
          // 顶层评论放到列表前端，保持倒序
          target.comments.unshift({ ...newComment, children: [] })
        }
        else {
          const root = target.comments.find(c => c.id === newComment.parentId)
          if (root) {
            root.children = root.children || []
            // 子评论插入到被回复评论之后（若找不到则追加末尾）
            const insertAfterIdx = root.children.findIndex(c => c.id === newComment.replyToCommentId)
            if (insertAfterIdx >= 0) {
              root.children.splice(insertAfterIdx + 1, 0, newComment)
            }
            else {
              root.children.push(newComment)
            }
            root.childCount = (root.childCount || 0) + 1
          }
          else {
            target.comments.unshift({ ...newComment, children: [] })
          }
        }
        target.commentCount = (target.commentCount || 0) + 1
      }

      // 列表预览只更新计数，不展开评论列表
      const moment = this.momentList.find(m => m.id === momentId)
      if (moment) {
        moment.commentCount = (moment.commentCount || 0) + 1
      }
    },

    /**
     * @description: 加载单条动态详情（包含更多评论/点赞）
     */
    async loadMomentDetail(momentId: string) {
      const res = await getMomentDetailApi({
        momentId,
      })
      this.currentMomentDetail = res.result as IMomentInfo
      if (this.currentMomentId !== momentId) {
        this.currentMomentId = momentId
      }
    },

    /**
     * @description: 刷新评论（分页）
     */
    async refreshComments(momentId: string, page = 1, limit = 20) {
      const res = await getMomentRootCommentsApi({
        momentId,
        page,
        limit,
      })
      if (this.currentMomentDetail && this.currentMomentDetail.id === momentId) {
        this.currentMomentDetail.comments = res.result.list
      }
    },

    /**
     * @description: 追加加载评论（分页）
     */
    async loadMoreComments(momentId: string, page = 1, limit = 20) {
      const res = await getMomentRootCommentsApi({
        momentId,
        page,
        limit,
      })
      if (this.currentMomentDetail && this.currentMomentDetail.id === momentId) {
        this.currentMomentDetail.comments = [
          ...(this.currentMomentDetail.comments || []),
          ...res.result.list,
        ]
      }
    },

    /**
     * @description: 加载/追加子评论（分页，不包含下级）
     */
    async loadChildComments(momentId: string, parentId: string, page = 1, limit = 20) {
      const res = await getMomentChildCommentsApi({
        momentId,
        parentId,
        page,
        limit,
      })

      if (this.currentMomentDetail && this.currentMomentDetail.id === momentId) {
        const root = this.currentMomentDetail.comments?.find(c => c.id === parentId)
        if (root) {
          const existingChildren = root.children || []
          root.children = page === 1 ? res.result.list : [...existingChildren, ...res.result.list]
          root.childCount = res.result.count
        }
      }
    },

    /**
     * @description: 刷新点赞（分页）
     */
    async refreshLikes(momentId: string, page = 1, limit = 50) {
      const res = await getMomentLikesApi({
        momentId,
        page,
        limit,
      })
      const moment = this.momentList.find(m => m.id === momentId)
      if (moment) {
        moment.likes = res.result.list
        moment.likeCount = res.result.count
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
      if (this.currentMomentDetail && this.currentMomentDetail.id === this.currentMomentId) {
        return this.currentMomentDetail
      }
      return this.momentList.find(m => m.id === this.currentMomentId)
    },

  },
})
