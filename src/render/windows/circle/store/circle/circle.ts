import type { ICircleListItem, ICirclePostItem } from 'commonModule/type/ajax/circle'
import { defineStore } from 'pinia'
import Message from 'renderModule/components/ui/message'
import {
  createCircleApi,
  createPostApi,
  getMyCircleListApi,
  getPostListApi,
  joinCircleApi,
  likePostApi,
} from 'renderModule/api/circle'

export const useCircleStore = defineStore('useCircleStore', {
  state: () => ({
    myCircles: [] as ICircleListItem[],
    currentCircleId: '',
    postList: [] as ICirclePostItem[],
    loadingCircles: false,
    loadingPosts: false,
    showCreateCircle: false,
    showCreatePost: false,
  }),
  getters: {
    currentCircle(state): ICircleListItem | undefined {
      return state.myCircles.find(item => item.circleId === state.currentCircleId)
    },
  },
  actions: {
    selectCircle(circleId: string) {
      this.currentCircleId = circleId
      this.loadPosts(1)
    },
    openCreateCircle() {
      this.showCreateCircle = true
    },
    closeCreateCircle() {
      this.showCreateCircle = false
    },
    openCreatePost() {
      this.showCreatePost = true
    },
    closeCreatePost() {
      this.showCreatePost = false
    },
    async loadMyCircles() {
      this.loadingCircles = true
      const res = await getMyCircleListApi({ page: 1, limit: 100 })
      this.loadingCircles = false
      if (res.code !== 0) {
        Message.error(res.msg || '获取圈子列表失败')
        return
      }
      this.myCircles = res.result.list || []
      if (!this.currentCircleId && this.myCircles.length > 0)
        this.selectCircle(this.myCircles[0].circleId)
    },
    async createCircle(name: string, description: string) {
      const res = await createCircleApi({
        name: name.trim(),
        description: description.trim(),
        joinType: 0,
      })
      if (res.code !== 0) {
        Message.error(res.msg || '创建圈子失败')
        return false
      }
      this.closeCreateCircle()
      await this.loadMyCircles()
      this.selectCircle(res.result.circleId)
      return true
    },
    async joinCircle(circleId: string) {
      const res = await joinCircleApi({ circleId })
      if (res.code !== 0) {
        Message.error(res.msg || '加入圈子失败')
        return
      }
      if (res.result.status === 0)
        Message.success('申请已提交，等待圈主审批')
      else
        Message.success('已加入圈子')
      await this.loadMyCircles()
      if (res.result.status === 1)
        this.selectCircle(circleId)
    },
    async loadPosts(page = 1) {
      if (!this.currentCircleId)
        return
      this.loadingPosts = true
      const res = await getPostListApi({
        circleId: this.currentCircleId,
        page,
        limit: 50,
      })
      this.loadingPosts = false
      if (res.code !== 0) {
        Message.error(res.msg || '获取帖子失败')
        return
      }
      this.postList = res.result.list || []
    },
    async createPost(content: string, title = '') {
      if (!this.currentCircleId)
        return false
      const res = await createPostApi({
        circleId: this.currentCircleId,
        title: title.trim(),
        content: content.trim(),
      })
      if (res.code !== 0) {
        Message.error(res.msg || '发布帖子失败')
        return false
      }
      this.closeCreatePost()
      await this.loadPosts(1)
      return true
    },
    async toggleLike(postId: string) {
      const target = this.postList.find(item => item.postId === postId)
      if (!target)
        return
      const nextStatus = !target.isLiked
      const res = await likePostApi({ postId, status: nextStatus })
      if (res.code !== 0) {
        Message.error(res.msg || '操作失败')
        return
      }
      target.isLiked = nextStatus
      target.likeCount = Math.max(0, target.likeCount + (nextStatus ? 1 : -1))
    },
    async refreshAll() {
      await this.loadMyCircles()
      if (this.currentCircleId)
        await this.loadPosts(1)
    },
  },
})
