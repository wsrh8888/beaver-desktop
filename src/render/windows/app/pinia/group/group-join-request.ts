import type { IGroupJoinRequestListRes } from 'commonModule/type/ajax/group'
import { defineStore } from 'pinia'
import { handleGroupJoinRequestApi } from 'renderModule/api/group'
import { useContactStore } from '../contact/contact'

/**
 * @description: 群申请信息管理
 */
export const useGroupJoinRequestStore = defineStore('groupJoinRequestStore', {
  state: (): {
    groupJoinRequestList: IGroupJoinRequestListRes['list']
    totalCount: number
    currentPage: number
    pageSize: number
  } => ({
    /**
     * @description: 群申请列表
     */
    groupJoinRequestList: [],
    /**
     * @description: 总数
     */
    totalCount: 0,
    /**
     * @description: 当前页码
     */
    currentPage: 1,
    /**
     * @description: 每页大小
     */
    pageSize: 20,
  }),

  getters: {
    /**
     * @description: 获取增强后的申请列表（包含联系人信息）
     */
    getEnhancedRequestList: (state) => {
      const contactStore = useContactStore()

      return state.groupJoinRequestList.map((item) => {
        // 从contactStore获取最新的联系人信息
        const contactInfo = contactStore.getContact(item.applicantId)
        if (contactInfo) {
          // 返回增强后的申请信息
          return {
            ...item,
            applicantName: contactInfo.nickName || item.applicantName,
            applicantAvatar: contactInfo.avatar || item.applicantAvatar,
          }
        }
        return item
      })
    },

    /**
     * @description: 获取待处理的申请数量
     */
    pendingCount: (state) => {
      return state.groupJoinRequestList.filter(item => item.status === 0).length
    },
  },

  actions: {
    /**
     * @description: 初始化加载群申请列表
     */
    async init(page: number = 1, limit: number = 20) {
      try {
        const res = await electron.database.group.getAllGroupJoinRequests({
          page,
          limit,
        })

        this.groupJoinRequestList = res.list || []
        this.totalCount = res.count || 0
        this.currentPage = page
        this.pageSize = limit

        // 将申请者用户信息同步到联系人缓存中
        const contactStore = useContactStore()
        this.groupJoinRequestList.forEach((item) => {
          if (item.applicantId) {
            contactStore.updateContact(item.applicantId, {
              userId: item.applicantId,
              nickName: item.applicantName,
              avatar: item.applicantAvatar,
            })
          }
        })

        return res
      }
      catch (error) {
        console.error('加载群申请列表失败:', error)
        throw error
      }
    },

    /**
     * @description: 处理群申请
     */
    async handleRequest(requestId: number, status: number) {
      try {
        // 直接调用外网API处理申请
        await handleGroupJoinRequestApi({
          requestId,
          status,
        })

        // 更新本地状态
        const request = this.groupJoinRequestList.find(item => item.requestId === requestId)
        if (request) {
          request.status = status
        }

        return true
      }
      catch (error) {
        console.error('处理群申请失败:', error)
        throw error
      }
    },

    /**
     * @description: 刷新列表
     */
    async refresh() {
      return this.init(this.currentPage, this.pageSize)
    },

    /**
     * @description: 加载更多
     */
    async loadMore() {
      if (this.groupJoinRequestList.length >= this.totalCount) {
        return // 没有更多数据了
      }

      const nextPage = this.currentPage + 1
      try {
        const res = await electron.database.group.getAllGroupJoinRequests({
          page: nextPage,
          limit: this.pageSize,
        })

        const newList = res.list || []
        this.groupJoinRequestList = [...this.groupJoinRequestList, ...newList]
        this.totalCount = res.count || 0
        this.currentPage = nextPage

        // 同步新用户信息到联系人缓存
        const contactStore = useContactStore()
        newList.forEach((item) => {
          if (item.applicantId) {
            contactStore.updateContact(item.applicantId, {
              userId: item.applicantId,
              nickName: item.applicantName,
              avatar: item.applicantAvatar,
            })
          }
        })

        return res
      }
      catch (error) {
        console.error('加载更多群申请失败:', error)
        throw error
      }
    },
  },
})
