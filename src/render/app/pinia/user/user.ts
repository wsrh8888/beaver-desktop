import type { IUserInfoRes } from 'commonModule/type/ajax/user'
import { defineStore } from 'pinia'
import { updateInfoApi } from 'renderModule/api//user'

/**
 * @description: 用户自己的信息
 */
export const useUserStore = defineStore('useUserStore', {
  /**
   * @description: 用户状态
   */
  state: (): {
    /** 当前登录用户信息 */
    userInfo: IUserInfoRes
  } => ({
    userInfo: {
      userId: '',
      nickName: '',
      avatar: '',
      abstract: '',
      gender: 0,
    },
  }),

  /**
   * @description: 状态计算属性
   */
  getters: {
  },

  actions: {
    /**
     * @description: 初始化用户信息
     * @return {Promise<void>}
     * @throws {Error} 获取用户信息失败时抛出错误
     */
    async init() {
      const userInfo = await electron.database.user.getUserInfo()
      if (userInfo) {
        this.userInfo = userInfo
      }
    },

    /**
     * @description: 更新自己的个人信息
     * @param {Partial<IUserInfo>} updates - 需要更新的用户信息字段
     * @return {Promise<boolean>} 更新是否成功
     */
    async updateUserInfo(updates: Partial<IUserInfoRes>) {
      const res = await updateInfoApi(updates)
      if (res.code === 0) {
        const updatedUser = {
          ...this.userInfo,
          ...updates,
        }
        this.userInfo = updatedUser
        return true
      }
    },

    /**
     * @description: 重置用户状态
     * @return {void}
     */
    reset() {
      this.userInfo = {
        userId: '',
        phone: '',
        nickName: '',
        fileName: '',
        abstract: '',
        gender: 0,
      }
    },
  },
})
