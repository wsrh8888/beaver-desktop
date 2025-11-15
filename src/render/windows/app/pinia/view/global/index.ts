import { defineStore } from 'pinia'

// 全局组件类型
export type GlobalComponentType = 'userinfo' | 'profile' | 'settings' | 'update' | null

/**
 * @description: 全局组件状态管理
 */
export const useGlobalStore = defineStore('useGlobalStore', {
  state: () => ({
    /**
     * @description: 当前显示的全局组件
     */
    currentComponent: null as GlobalComponentType,
  }),

  actions: {
    /**
     * @description: 设置当前组件
     */
    setComponent(component: GlobalComponentType) {
      this.currentComponent = component
    },
  },
})
